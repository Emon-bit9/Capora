"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/Button";
import { Sparkles, Copy, RefreshCw } from "lucide-react";
import { toast } from "react-hot-toast";

const captionSchema = z.object({
  videoDescription: z.string().min(10, "Description must be at least 10 characters"),
  tone: z.enum(["casual", "professional", "fun", "motivational", "educational", "trendy"]),
  niche: z.enum(["fitness", "food", "education", "lifestyle", "business", "tech"]),
  includeHashtags: z.boolean().default(true),
  maxLength: z.number().min(50).max(1000).default(300),
});

type CaptionFormData = z.infer<typeof captionSchema>;

interface GeneratedCaption {
  caption: string;
  hashtags: string[];
}

export function CaptionGenerator() {
  const [generatedCaption, setGeneratedCaption] = useState<GeneratedCaption | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<CaptionFormData>({
    resolver: zodResolver(captionSchema),
    defaultValues: {
      tone: "casual",
      niche: "lifestyle",
      includeHashtags: true,
      maxLength: 300,
    },
  });

  const onSubmit = async (data: CaptionFormData) => {
    setIsGenerating(true);
    try {
      const response = await fetch("/api/v1/captions/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to generate caption");
      }

      const result = await response.json();
      setGeneratedCaption(result);
      toast.success("Caption generated successfully!");
    } catch (error) {
      toast.error("Failed to generate caption. Please try again.");
      console.error("Caption generation error:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Copied to clipboard!");
    } catch (error) {
      toast.error("Failed to copy to clipboard");
    }
  };

  const regenerateCaption = () => {
    handleSubmit(onSubmit)();
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          AI Caption Generator
        </h1>
        <p className="text-gray-600">
          Generate engaging captions for your social media content with AI
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Form */}
        <div className="bg-white rounded-lg border p-6 shadow-sm">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Video Description
              </label>
              <textarea
                {...register("videoDescription")}
                placeholder="Describe your video content..."
                className="w-full min-h-[100px] p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={4}
              />
              {errors.videoDescription && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.videoDescription.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tone
                </label>
                <select {...register("tone")} className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                  <option value="casual">Casual</option>
                  <option value="professional">Professional</option>
                  <option value="fun">Fun</option>
                  <option value="motivational">Motivational</option>
                  <option value="educational">Educational</option>
                  <option value="trendy">Trendy</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Niche
                </label>
                <select {...register("niche")} className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                  <option value="fitness">Fitness</option>
                  <option value="food">Food</option>
                  <option value="education">Education</option>
                  <option value="lifestyle">Lifestyle</option>
                  <option value="business">Business</option>
                  <option value="tech">Tech</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Maximum Length: {watch("maxLength")} characters
              </label>
              <input
                type="range"
                {...register("maxLength", { valueAsNumber: true })}
                min="50"
                max="1000"
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                {...register("includeHashtags")}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label className="ml-2 text-sm text-gray-700">
                Include hashtags
              </label>
            </div>

            <Button
              type="submit"
              loading={isGenerating}
              className="w-full"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Generate Caption
            </Button>
          </form>
        </div>

        {/* Generated Caption */}
        <div className="bg-white rounded-lg border p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Generated Caption
            </h2>
            {generatedCaption && (
              <Button
                variant="outline"
                size="sm"
                onClick={regenerateCaption}
                disabled={isGenerating}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Regenerate
              </Button>
            )}
          </div>

          {generatedCaption ? (
            <div className="space-y-4">
              <div className="relative">
                <div className="bg-gray-50 rounded-lg p-4 min-h-[120px]">
                  <p className="text-gray-900 leading-relaxed">
                    {generatedCaption.caption}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(generatedCaption.caption)}
                  className="absolute top-2 right-2"
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>

              {generatedCaption.hashtags.length > 0 && (
                <div className="relative">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">
                    Hashtags
                  </h3>
                  <div className="bg-blue-50 rounded-lg p-4">
                    <p className="text-blue-900 text-sm">
                      {generatedCaption.hashtags.join(" ")}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      copyToClipboard(generatedCaption.hashtags.join(" "))
                    }
                    className="absolute top-6 right-2"
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              )}

              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() =>
                    copyToClipboard(
                      `${generatedCaption.caption}\n\n${generatedCaption.hashtags.join(
                        " "
                      )}`
                    )
                  }
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copy All
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <Sparkles className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">
                Enter your video description and click "Generate Caption" to get
                started
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 