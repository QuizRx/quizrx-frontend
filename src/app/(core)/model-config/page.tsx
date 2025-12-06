"use client";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/core/components/ui/card";
import { Separator } from "@/core/components/ui/separator";
import { useState, useEffect } from "react";
import { Button } from "@/core/components/ui/button";
import { Input } from "@/core/components/ui/input";
import {
  GET_USER_PREFERENCE,
  UPDATE_USER_PREFERENCE,
  TEST_OPENAI_APIKEY,
} from "@/modules/graph/apollo/query/user-preference";
import { useQuery, useMutation } from "@apollo/client";
import { useToast } from "@/core/hooks/use-toast";
import extractCustomError from "@/core/utils/extract-custom-error";
import { EmbeddingModel, Model } from "@/modules/graph/types/api/enum";
import Image from "next/image";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/core/components/ui/select";

type CardType = {
  modelName: Model;
  modelKey: string;
  provider: string;
  description: string;
  latency: string;
  cost: string;
};

type ProviderType = {
  name: string;
  description: string;
  specialty: string;
  logoPath?: string;
};

export default function Neo4jPage() {
  const { toast } = useToast();
  const [selectedModel, setSelectedModel] = useState(Model.O4_MINI);
  const [apiKey, setApiKey] = useState<string>("");
  const [isTestingAPIKey, setIsTestingAPIKey] = useState<boolean>(false);
  const [isAPIKeyValid, setIsAPIKeyValid] = useState<boolean>(false);

  const [updateUserPreference, { loading: updateLoading }] = useMutation(
    UPDATE_USER_PREFERENCE,
  );

  const { data, loading, error, refetch } = useQuery(GET_USER_PREFERENCE, {
    fetchPolicy: "network-only",
  });

  const [testAPIkey,{loading:testingAPIKey}] = useMutation(TEST_OPENAI_APIKEY);

  useEffect(() => {
    if (data?.findByUserIdUserPreference?.data) {
      setSelectedModel(data.findByUserIdUserPreference.data.modelName as Model);
      setApiKey(data.findByUserIdUserPreference.data.apiKey);
    }
    if (error) {
      const customError = extractCustomError(error);
      customError.map((error) => {
        toast({
          variant: "destructive",
          title: error.message,
          description: error.details.error,
        });
      });
    }
  }, [data, error, toast]);

  const providerData: ProviderType[] = [
    {
      name: "OpenAI",
      description: "Leading AI research company with GPT and o-series models",
      specialty: "Conversational AI, Code Generation",
      logoPath: "/logo/openai-logo.svg"
    },
    {
      name: "Anthropic",
      description: "AI safety-focused company with Claude models",
      specialty: "Safe AI, Constitutional AI",
      logoPath: "/logo/ant.png"
    },
    {
      name: "Google",
      description: "Tech giant with Gemini and PaLM model families",
      specialty: "Multimodal AI, Search Integration",
      logoPath: "/logo/google.svg"
    },
    {
      name: "Meta",
      description: "Social media company with Llama open-source models",
      specialty: "Open Source, Social Applications",
      logoPath: "/logo/meta.png"
    },
  ];

  const cardData: CardType[] = [
    {
      modelName: Model.O4_MINI,
      modelKey: "O4_MINI",
      provider: "OpenAI",
      description:
        "Lightweight model from the o3 series, optimized for speed and efficiency.",
      latency: "low",
      cost: "very low",
    },
    {
      modelName: Model.GPT_41,
      modelKey: "GPT_41",
      provider: "OpenAI",
      description:
        "Latest GPT-4.1 model with enhanced capabilities and balanced performance.",
      latency: "medium",
      cost: "high",
    },
    {
      modelName: Model.GPT_41_MINI,
      modelKey: "GPT_41_MINI",
      provider: "OpenAI",
      description:
        "Compact GPT-4.1 variant offering strong performance with improved efficiency.",
      latency: "low",
      cost: "medium",
    },
    {
      modelName: Model.GPT_4O,
      modelKey: "GPT_4O",
      provider: "OpenAI",
      description:
        "Most advanced, multimodal model with superior reasoning and accuracy.",
      latency: "low",
      cost: "medium",
    },
    {
      modelName: Model.GPT_4O_MINI,
      modelKey: "GPT_4O_MINI",
      provider: "OpenAI",
      description:
        "Smaller GPT-4o variant with multimodal support and fast responses.",
      latency: "low",
      cost: "low",
    },
  ];

  const handleCardClick = (card: CardType) => {
    setSelectedModel(card.modelName);
  };

  const handleReset = () => {
    setSelectedModel(Model.O4_MINI);
    setApiKey("");
  };

  const handleTestAPIkey = async () => {
    const res = await testAPIkey({
      variables: {
        input: {
          apiKey: apiKey,
        },
      },
    });
    setIsAPIKeyValid(res?.data?.testOpenAIconnection?.success as boolean);
    setIsTestingAPIKey(true);
  };

  const handleSavePreference = async () => {
    if(apiKey.length > 0 && !isAPIKeyValid) {
        toast({
          title: "Error",
          description:
            "Please use valid API key and test it or leave it empty",
          variant: "destructive",
        });
      return
    }

    
    await updateUserPreference({
      variables: {
        input: {
          modelName: cardData.filter(
            (cardData) => cardData.modelName === selectedModel,
          )[0].modelKey as Model,
          embeddingModel: "ADA_002" as EmbeddingModel,
          apiKey: apiKey,
        },
      },
      onCompleted: () => {
        toast({
          title: "Configurations saved",
          description:
            "Your LLM's configurations have been saved successfully.",
        });
        setIsAPIKeyValid(false)
      },
      onError: (error) => {
        console.error("Error during create:", error);
        toast({
          title: "Error",
          description:
            error instanceof Error
              ? error.message
              : "An unknown error occurred",
          variant: "destructive",
        });
      },
    });
  };

  return (
    <main className="p-4">
      <div className="mb-8">
        <h1 className="text-3xl mb-1">LLM Configuration</h1>
        <p className="text-foreground/50 mb-6 mt-2">
          Choose a language model to process your data. Each model has different
          capabilities and costs.
        </p>
      </div>

      <Separator className="mt-5" />
      
      {/* Top 5 AI LLM Providers Section */}
      <div className="mt-6 mb-8">
        <h2 className="text-2xl mb-4">Model Providers</h2>
        <p className="text-foreground/50 mb-6">
          Leading companies in artificial intelligence and large language model development
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {providerData.map((provider) => (
            <Card key={provider.name} className="rounded-xl border-muted-foreground/20 hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex flex-col items-start text-center">
                  <div className="w-18 h-18 mb-3 bg-gray-100 rounded-lg flex items-center justify-center">
                    {provider.logoPath ? (
                      <Image
                        src={provider.logoPath}
                        alt={`${provider.name} Logo`}
                        width={32}
                        height={32}
                        className="object-contain"
                      />
                    ) : (
                      <span className="text-lg font-bold text-gray-600">
                        {provider.name.charAt(0)}
                      </span>
                    )}
                  </div>
                  <CardTitle className="text-sm font-semibold">
                    {provider.name}
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                {/* <p className="text-xs text-gray-600 mb-2 text-center">
                  {provider.description}
                </p> */}
                {/* <div className="bg-blue-50 px-2 py-1 rounded-lg">
                  <p className="text-xs text-blue-700 font-medium text-center">
                    {provider.specialty}
                  </p>
                </div> */}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <Separator className="mt-5" />
      <h2 className="text-2xl mt-6">Select a Language Model</h2>

      <div className="grid grid-cols-1 md:grid-cols-1 gap-8 w-full max-w-5xl mb-8 mt-8">
        {cardData.map((card) => (
          <Card
            key={card.modelName}
            className={`rounded-2xl hover:cursor-pointer shadow-sm border-muted-foreground/20 ${
              card.modelName === selectedModel && "border-primary"
            }`}
            onClick={() => handleCardClick(card)}
          >
            <CardHeader className="pb-2">
              <div className="flex justify-between gap-2">
                <div className="flex gap-4">
                  <Image
                    src="/logo/openai-logo.svg"
                    alt="OpenAi Logo"
                    width={44}
                    height={44}
                  />

                  <div>
                    <CardTitle className="text-base select-none">
                      {card.modelName}
                    </CardTitle>
                    <p className="block text-xs text-zinc-500">
                      {card.provider}
                    </p>
                  </div>
                </div>

                <div>
                  {selectedModel === card.modelName && (
                    <Image
                      className="text-primary h-5 w-5"
                      src="/filled-check.svg"
                      alt="Filled Check icon"
                      width={44}
                      height={44}
                    />
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="select-none text-xs mt-2">{card.description}</p>

              <div className="select-none text-xs mt-4 flex gap-4">
                <p className="bg-gray-200 px-2.5 py-1 rounded-2xl capitalize">{`Latency: ${card.latency}`}</p>
                <p className="bg-gray-200 px-2.5 py-1 rounded-2xl capitalize">{`Cost: ${card.cost}`}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <Separator className="mt-5" />

      <h2 className="text-2xl mt-6">Select an Embedding Method</h2>

      <p className="text-foreground/50 mb-6 mt-2">
        Choose an embedding technique to vectorize your data for processing.
      </p>

      <Select defaultValue={"text-embedding-ada-002"}>
        <SelectTrigger className="max-w-xs">
          <SelectValue placeholder="Select embedding model" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="text-embedding-ada-002">
            text-embedding-ada-002
          </SelectItem>
          <SelectItem value="text-embedding-3-small">
            text-embedding-3-small
          </SelectItem>
          <SelectItem value="text-embedding-3-large">
            text-embedding-3-large
          </SelectItem>
        </SelectContent>
      </Select>

      <div className="py-4">
        <h3 className="text-sm font-medium mt-4 mb-3">API Key</h3>
        <div className="flex">
          <Input
            value={apiKey}
            type="text"
            className="bg-transparent w-2/3"
            placeholder="Enter API Key"
            onChange={(e) => setApiKey(e.target.value)}
          />
          <Button disabled={!apiKey || testingAPIKey} loading={testingAPIKey} className=" ml-4 rounded-lg px-6" onClick={handleTestAPIkey}>
            Test
          </Button>
        </div>
        <span className="text-xs mt-3 block">
          Your API key will be securely stored and used for authentication.
        </span>

        {isTestingAPIKey && (
          <>
            <span className="text-sm block mt-6 mb-3">Test Response</span>

            <div className="my-1 h-auto bg-slate-900 rounded-lg border border-zinc-800 overflow-auto p-4 w-1/4">
              <pre className="text-zinc-300 text-xs font-mono">
                {JSON.stringify(
                  {
                    status: isAPIKeyValid ? "Successful" : "Failed"
                  },
                  null,
                  2,
                )}
              </pre>
            </div>
          </>
        )}
      </div>

      <Separator className="mt-5" />
      <div className="flex gap-4 mt-6">
        <Button onClick={handleSavePreference}>Save Configuration</Button>
        <Button onClick={handleReset} variant="outline">
          Reset
        </Button>
      </div>
    </main>
  );
}