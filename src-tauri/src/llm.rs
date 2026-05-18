use std::pin::Pin;

use async_trait::async_trait;
use futures_util::{Stream, StreamExt};
use rig_core::{
    OneOrMany,
    agent::{MultiTurnStreamItem, Text},
    client::{CompletionClient, ModelListingClient},
    completion,
    message::{AssistantContent, UserContent},
    providers::ollama,
    streaming::{StreamedAssistantContent, StreamingChat},
};
use tauri_plugin_log::log;

#[derive(PartialEq, Eq, Debug, Clone, Copy)]
pub enum ProviderKind {
    Ollama,
}

pub struct ModelInfo {
    id: String,
    display_name: Option<String>,
    provider: ProviderKind,
}

pub enum GenerationEvent {
    Delta(String),
    Finished(Option<String>),
    Error(String),
}

pub enum Message {
    SystemMessage(String),
    UserMessage(String),
    AssistantMessage(String),
}

pub struct GenerationRequest {
    pub model_id: String,
    pub system_prompt: Option<String>,
    pub history: Vec<Message>,
    pub prompt: String,
}

pub type GenerationStream = Pin<Box<dyn Stream<Item = GenerationEvent> + Send>>;

#[async_trait]
pub trait LlmProvider {
    async fn generate_stream(&self, request: GenerationRequest)
    -> anyhow::Result<GenerationStream>;

    async fn list_models(&self) -> anyhow::Result<Vec<ModelInfo>>;
}

pub struct OllamaProvider {
    client: ollama::Client,
}

impl OllamaProvider {
    pub fn new(base_url: impl AsRef<str>) -> anyhow::Result<Self> {
        let client = ollama::Client::builder()
            .api_key(rig_core::client::Nothing)
            .base_url(base_url)
            .build()?;

        Ok(Self { client })
    }
}

impl From<Message> for completion::Message {
    fn from(value: Message) -> Self {
        match value {
            Message::SystemMessage(text) => completion::Message::System { content: text },
            Message::UserMessage(text) => completion::Message::User {
                content: OneOrMany::one(UserContent::Text(Text { text })),
            },
            Message::AssistantMessage(text) => completion::Message::Assistant {
                id: None,
                content: OneOrMany::one(AssistantContent::Text(Text { text })),
            },
        }
    }
}

#[async_trait]
impl LlmProvider for OllamaProvider {
    async fn generate_stream(
        &self,
        request: GenerationRequest,
    ) -> anyhow::Result<GenerationStream> {
        let mut agent = self.client.agent(request.model_id);
        if let Some(system_prompt) = request.system_prompt {
            agent = agent.preamble(&system_prompt);
        }
        let agent = agent.build();
        let stream = agent.stream_chat(request.prompt, request.history).await;

        // Convert Rig's types to our types.
        let stream = stream.filter_map(|item| async {
            match item {
                Ok(item) => match item {
                    MultiTurnStreamItem::FinalResponse(final_response) => Some(
                        GenerationEvent::Finished(Some(final_response.response().to_owned())),
                    ),
                    MultiTurnStreamItem::StreamAssistantItem(StreamedAssistantContent::Text(
                        Text { text },
                    )) => Some(GenerationEvent::Delta(text)),
                    MultiTurnStreamItem::StreamAssistantItem(StreamedAssistantContent::Final(
                        _,
                    )) => None,
                    _ => {
                        log::warn!("Ignore `MultiTurnStreamItem`");
                        None
                    }
                },
                Err(e) => Some(GenerationEvent::Error(e.to_string())),
            }
        });

        Ok(Box::pin(stream))
    }

    async fn list_models(&self) -> anyhow::Result<Vec<ModelInfo>> {
        let list = self.client.list_models().await?;

        Ok(list
            .into_iter()
            .map(|model| ModelInfo {
                display_name: Some(model.display_name().to_owned()),
                id: model.id,
                provider: ProviderKind::Ollama,
            })
            .collect())
    }
}
