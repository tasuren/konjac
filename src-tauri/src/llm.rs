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

use crate::settings::ProviderSettings;

#[derive(PartialEq, Eq, Debug, Clone, Copy)]
pub enum ProviderKind {
    Ollama,
}

pub struct Model {
    pub provider: ProviderKind,
    pub id: String,
    pub display_name: Option<String>,
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

pub struct LlmProviders {
    ollama: OllamaProvider,
}

impl LlmProviders {
    pub fn new(settings: &ProviderSettings) -> anyhow::Result<Self> {
        Ok(Self {
            ollama: OllamaProvider::new(
                &settings.ollama.base_url,
                settings.ollama.keep_alive.clone(),
            )?,
        })
    }

    pub async fn generate_stream(
        &self,
        provider: ProviderKind,
        request: GenerationRequest,
    ) -> anyhow::Result<GenerationStream> {
        match provider {
            ProviderKind::Ollama => self.ollama.generate_stream(request).await,
        }
    }

    pub async fn list_models(&self) -> anyhow::Result<Vec<Model>> {
        Ok(self.ollama.list_models().await?)
    }
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

    async fn list_models(&self) -> anyhow::Result<Vec<Model>>;
}

pub struct OllamaProvider {
    client: ollama::Client,
    keep_alive: Option<String>,
}

impl OllamaProvider {
    pub fn new(base_url: impl AsRef<str>, keep_alive: Option<String>) -> anyhow::Result<Self> {
        let client = ollama::Client::builder()
            .api_key(rig_core::client::Nothing)
            .base_url(base_url)
            .build()?;

        Ok(Self { client, keep_alive })
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

        if let Some(keep_alive) = self.keep_alive.as_ref() {
            agent = agent.additional_params(serde_json::json!({
                "keep_alive": keep_alive
            }));
        }

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

    async fn list_models(&self) -> anyhow::Result<Vec<Model>> {
        let list = self.client.list_models().await?;

        Ok(list
            .into_iter()
            .map(|model| Model {
                display_name: Some(model.display_name().to_owned()),
                id: model.id,
                provider: ProviderKind::Ollama,
            })
            .collect())
    }
}
