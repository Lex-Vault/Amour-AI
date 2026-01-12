import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { analyzeChatImage, analyzeChatText } from "@/services/ai";
import {
  Loader2,
  AlertTriangle,
  CheckCircle2,
  MessageSquare,
  Copy,
  ArrowLeft,
  Bot,
  Shield,
  Zap,
  Sparkles,
  Coins,
  Heart,
  Gift,
  ThumbsUp,
  ListChecks,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";
import LoveMeter from "@/components/LoveMeter";
import { useAuth } from "@/context/AuthContext";

type Mode = "paste" | "upload";

const ChatAnalyzer = () => {
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>("paste");
  const [input, setInput] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  const { toast } = useToast();
  const { user, fetchUser } = useAuth();
  useEffect(() => {
    fetchUser();
  }, [fetchUser]);
  const handleFileChange = (f?: File) => {
    if (!f) {
      setFile(null);
      setPreviewUrl(null);
      return;
    }
    setFile(f);
    const url = URL.createObjectURL(f);
    setPreviewUrl(url);
  };

  // normalize API response: some endpoints return { ok, result } while others return the object directly
  const normalize = (data) => {
    if (!data) return null;
    return data.result ?? data;
  };

  const handleAnalyzeText = async () => {
    if (!input.trim()) {
      toast({
        title: "Empty Input",
        description: "Paste a chat conversation first.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      if (!user) {
        navigate("/signup");
        toast({
          title: "Error",
          description: "Please Login to Continue.",
          variant: "destructive",
        });
        return;
      }
      if (user.credits < 1) {
        toast({
          title: "Insufficient Credits",
          description: "Please buy credits to generate bios.",
          variant: "destructive",
        });
        return;
      }
      const data = await analyzeChatText(input);
      setResult(normalize(data));
      fetchUser();
      toast({
        title: "Analysis Complete",
        description: "Your war room is ready.",
      });
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: error?.message || "Failed to analyze chat.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnalyzeImage = async () => {
    if (!file) {
      toast({
        title: "No Image",
        description: "Please upload a chat screenshot first.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      if (!user) {
        navigate("/signup");
        toast({
          title: "Error",
          description: "Please Login to Continue.",
          variant: "destructive",
        });
        return;
      }
      if (user.credits < 4) {
        toast({
          title: "Insufficient Credits",
          description: "Please buy credits to generate bios.",
          variant: "destructive",
        });
        return;
      }
      const data = await analyzeChatImage(file);
      setResult(normalize(data));
      fetchUser();

      toast({
        title: "Analysis Complete",
        description: "Screenshot analyzed.",
      });
    } catch (err) {
      console.error(err);
      toast({
        title: "Error",
        description: err?.message || "Failed to analyze screenshot.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnalyze = () => {
    if (mode === "paste") handleAnalyzeText();
    else handleAnalyzeImage();
  };

  // small helpers
  const copyText = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copied!", description: "Response copied to clipboard." });
  };

  const safeGet = (path, fallback = null) => path ?? fallback;

  return (
    <div className="min-h-screen bg-background relative selection:bg-primary/20 overflow-x-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 -left-40 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 -right-40 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

      <div className="container mx-auto pt-20 py-6 px-4 max-w-5xl relative z-10">
        <div className="flex justify-between items-center mb-12">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="group pl-0 hover:bg-transparent text-muted-foreground hover:text-primary transition-colors"
          >
            <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            Back to Tools
          </Button>

          <div className="flex items-center gap-2">
            <div className="hidden md:flex md:fixed md:top-6 md:right-6 md:z-50 md:items-center md:gap-2">
              <div className="flex items-center gap-2 px-4 py-1.5 bg-secondary/60 rounded-xl border border-secondary text-sm font-medium shadow-sm">
                <Coins className="w-4 h-4 text-yellow-500" />
                <span className="text-lg font-semibold">
                  {user?.credits ?? 0}
                </span>
              </div>
              <Button
                variant="outline"
                className="ml-2 md:py-3 text-md bg-orange-700"
                onClick={() => navigate("/buy-credits")}
              >
                Buy Credits
              </Button>
            </div>

            <div className="flex md:hidden items-center gap-2 px-2">
              <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-secondary/30 border border-secondary text-sm font-medium">
                <Coins className="w-4 h-4 text-yellow-500" />
                <span className="text-md font-semibold">
                  {user?.credits ?? 0}
                </span>
              </div>
              <Button
                variant="outline"
                className="ml-2 py-1 text-sm"
                onClick={() => navigate("/buy-credits")}
              >
                Buy
              </Button>
            </div>
          </div>
        </div>

        {/* Header */}
        <div className="text-center mb-12 space-y-4">
          <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-primary/10 mb-4 ring-1 ring-primary/20">
            <MessageSquare className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">
            Chat War Room
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Paste your conversation history below or upload a chat screenshot.
            AI will deconstruct the subtext, flag red flags, and draft replies.
          </p>
        </div>

        <div className="grid gap-10">
          {/* Mode selector */}
          <div className="flex justify-center mb-2">
            <div className="inline-flex bg-muted/30 p-1 rounded-full border border-muted/20">
              <button
                onClick={() => setMode("paste")}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  mode === "paste"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground"
                }`}
                aria-pressed={mode === "paste"}
              >
                Paste Chats
              </button>
              <button
                onClick={() => setMode("upload")}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  mode === "upload"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground"
                }`}
                aria-pressed={mode === "upload"}
              >
                Upload Screenshot
              </button>
            </div>
          </div>

          {/* Input Section */}
          <Card className="border-muted/40 shadow-xl shadow-primary/5 bg-card/50 backdrop-blur-sm overflow-hidden">
            <CardContent className="p-0">
              {/* Paste mode */}
              {mode === "paste" && (
                <div className="p-6">
                  <Textarea
                    placeholder="Him: Hey, what's up?&#10;Me: Not much, just working.&#10;Him: Oh cool..."
                    className="min-h-[250px] font-mono text-sm leading-relaxed bg-background/50 border-muted-foreground/20 focus:border-primary/50 resize-y p-4 rounded-xl"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                  />
                </div>
              )}

              {/* Upload mode */}
              {mode === "upload" && (
                <div className="p-6 grid gap-4">
                  <div className="flex flex-col md:flex-row items-center gap-4">
                    <label className="w-full md:w-auto cursor-pointer">
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          handleFileChange(f);
                        }}
                      />
                      <div className="px-4 py-3 rounded-xl border border-muted/20 bg-background/50 text-sm text-muted-foreground w-full md:w-64 text-center">
                        Click to upload a screenshot
                      </div>
                    </label>

                    <div className="flex-1">
                      {file ? (
                        <div className="flex items-center justify-between gap-4">
                          <div className="text-sm text-foreground/90 break-words">
                            {file.name}
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              onClick={() => {
                                handleFileChange();
                              }}
                            >
                              Remove
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="text-sm text-muted-foreground">
                          No file selected
                        </div>
                      )}
                    </div>
                  </div>

                  {previewUrl && (
                    <div className="rounded-xl overflow-hidden border border-muted/20">
                      <img
                        src={previewUrl}
                        alt="preview"
                        className="w-full h-auto object-contain max-h-96"
                      />
                    </div>
                  )}
                </div>
              )}

              <div className="bg-muted/30 p-4 border-t border-muted/20 flex justify-end">
                <Button
                  onClick={handleAnalyze}
                  disabled={isLoading}
                  size="lg"
                  className="w-full md:w-auto min-w-[200px] h-12 text-base font-medium shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all rounded-xl"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />{" "}
                      Analyzing Intelligence...
                    </>
                  ) : (
                    <>
                      <Bot className="mr-2 h-5 w-5" /> Analyze Conversation
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Results Section */}
          {result && (
            <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
              <Tabs defaultValue="overview" className="w-full space-y-6">
                <div className="flex justify-center">
                  <TabsList className="grid w-full max-w-2xl grid-cols-4 h-12 bg-muted/50 p-1 rounded-full">
                    <TabsTrigger
                      value="overview"
                      className="rounded-full data-[state=active]:bg-background data-[state=active]:shadow-sm"
                    >
                      Overview
                    </TabsTrigger>
                    <TabsTrigger
                      value="flags"
                      className="rounded-full data-[state=active]:bg-background data-[state=active]:shadow-sm"
                    >
                      Flags
                    </TabsTrigger>
                    <TabsTrigger
                      value="intent"
                      className="rounded-full data-[state=active]:bg-background data-[state=active]:shadow-sm"
                    >
                      Intent
                    </TabsTrigger>
                    <TabsTrigger
                      value="responses"
                      className="rounded-full data-[state=active]:bg-background data-[state=active]:shadow-sm"
                    >
                      Replies
                    </TabsTrigger>
                  </TabsList>
                </div>

                {/* Tab: Overview */}
                <TabsContent
                  value="overview"
                  className="mt-0 focus-visible:outline-none"
                >
                  <div className="grid md:grid-cols-3 gap-6">
                    {/* Score + love meter */}
                    <Card className="col-span-1 bg-card/50 backdrop-blur-sm">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Heart className="h-5 w-5 text-pink-500" />
                          Relationship Score
                        </CardTitle>
                        <CardDescription>Quick snapshot</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {/* overall score */}
                          <LoveMeter
                            value={result?.love_meter ?? 0}
                          />
                          {/* subscores */}
                          <div>
                            <div className="text-sm text-muted-foreground mb-2">
                              Subscores
                            </div>
                            <div className="space-y-2">
                              {result.subscores &&
                                Object.entries(result.subscores).map(
                                  ([k, v]: [string, number]) => (
                                    <div key={k} className="text-sm">
                                      <div className="flex justify-between">
                                        <div className="capitalize">
                                          {k.replace("_", " ")}
                                        </div>
                                        <div className="font-medium">
                                          {v}/10
                                        </div>
                                      </div>
                                      <div className="w-full bg-muted/20 rounded-full h-2 mt-1 overflow-hidden">
                                        <div
                                          style={{
                                            width: `${(v / 10) * 100}%`,
                                          }}
                                          className="h-2 bg-primary"
                                        />
                                      </div>
                                    </div>
                                  )
                                )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Quick stats + chips */}
                    <div className="md:col-span-2 grid gap-6">
                      <Card className="bg-card/50 backdrop-blur-sm">
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <ListChecks className="h-5 w-5" />
                            Quick Takeaways
                          </CardTitle>
                          <CardDescription>
                            Concise signals from conversation
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="flex flex-wrap gap-2 mb-4">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/10 border text-sm">
                              <ThumbsUp className="h-4 w-4 text-green-600" />
                              <span className="font-semibold">
                                {result.greenFlags?.length ?? 0} green
                              </span>
                            </div>
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/10 border text-sm">
                              <AlertTriangle className="h-4 w-4 text-red-600" />
                              <span className="font-semibold">
                                {result.redFlags?.length ?? 0} red
                              </span>
                            </div>
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/10 border text-sm">
                              <Sparkles className="h-4 w-4 text-primary" />
                              <span className="font-semibold">
                                {safeGet(
                                  result.communication_clarity?.clarity_score,
                                  "--"
                                )}{" "}
                                clarity
                              </span>
                            </div>
                          </div>

                          <div className="grid md:grid-cols-2 gap-4">
                            {result?.suggested_messages.length !== 0 && (
                              <div>
                                <div className="text-sm text-muted-foreground mb-2">
                                  Suggested Next Messages
                                </div>
                                <div className="space-y-3">
                                  {(result.suggested_messages || [])
                                    .slice(0, 3)
                                    .map((m, i) => (
                                      <div
                                        key={i}
                                        className="flex items-start justify-between gap-4"
                                      >
                                        <div>
                                          <div className="text-sm font-medium">
                                            {m.purpose}
                                          </div>
                                          <div className="text-sm text-muted-foreground">
                                            {m.text}
                                          </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                          <Button
                                            variant="ghost"
                                            onClick={() => copyText(m.text)}
                                          >
                                            <Copy className="h-4 w-4" />
                                          </Button>
                                        </div>
                                      </div>
                                    ))}
                                </div>
                              </div>
                            )}

                            <div>
                              <div className="text-sm text-muted-foreground mb-2">
                                Quick Gifts & Compliments
                              </div>
                              <div className="space-y-3">
                                {(result.compliments || [])
                                  .slice(0, 2)
                                  .map((c, idx: number) => (
                                    <div
                                      key={idx}
                                      className="flex items-center gap-3"
                                    >
                                      <ThumbsUp className="h-5 w-5 text-green-600" />
                                      <div>
                                        <div className="text-sm font-medium">
                                          {c}
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                {(result.gift_suggestions || [])
                                  .slice(0, 2)
                                  .map((g, idx: number) => (
                                    <div
                                      key={idx}
                                      className="flex items-center gap-3"
                                    >
                                      <Gift className="h-5 w-5 text-amber-600" />
                                      <div>
                                        <div className="text-sm font-medium">
                                          {g}
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Which messages to keep / avoid */}
                      <Card className="bg-card/50 backdrop-blur-sm">
                        <CardHeader>
                          <CardTitle>Citation Guidance</CardTitle>
                          <CardDescription>
                            Which text to quote or avoid
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="grid md:grid-cols-2 gap-4">
                            <div>
                              <div className="text-sm text-muted-foreground mb-2">
                                Keep (quote)
                              </div>
                              <div className="flex flex-col gap-2">
                                {(
                                  result.which_messages_to_keep?.keep || []
                                ).map((k, i: number) => (
                                  <div
                                    key={i}
                                    className="px-3 py-2 border-[2px] text-green-500 rounded-md text-sm"
                                  >
                                    {k}
                                  </div>
                                ))}
                                {(!result.which_messages_to_keep?.keep ||
                                  result.which_messages_to_keep.keep.length ===
                                    0) && (
                                  <div className="text-sm text-muted-foreground italic">
                                    No strong keeps suggested.
                                  </div>
                                )}
                              </div>
                            </div>
                            <div>
                              <div className="text-sm text-muted-foreground mb-2">
                                Avoid (don't quote)
                              </div>
                              <div className="flex flex-col gap-2">
                                {(
                                  result.which_messages_to_keep?.avoid || []
                                ).map((k, i: number) => (
                                  <div
                                    key={i}
                                    className="px-3 py-2 border-[2px] text-red-500 rounded-md text-sm"
                                  >
                                    {k}
                                  </div>
                                ))}
                                {(!result.which_messages_to_keep?.avoid ||
                                  result.which_messages_to_keep.avoid.length ===
                                    0) && (
                                  <div className="text-sm text-muted-foreground italic">
                                    Nothing urgent to avoid.
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </TabsContent>

                {/* Tab: Flags */}
                <TabsContent
                  value="flags"
                  className="mt-0 focus-visible:outline-none"
                >
                  <div className="grid md:grid-cols-2 gap-6">
                    <Card className="border-l-4 border-l-red-500 shadow-sm hover:shadow-md transition-shadow bg-card/50 backdrop-blur-sm">
                      <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-red-500 text-lg">
                          <AlertTriangle className="h-5 w-5" /> Red Flags
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-3">
                          {result.redFlags && result.redFlags.length > 0 ? (
                            result.redFlags.map((flag, i: number) => (
                              <li
                                key={i}
                                className="flex items-start text-sm text-muted-foreground"
                              >
                                <span className="mr-3 text-red-500 mt-1.5 h-1.5 w-1.5 rounded-full bg-red-500 shrink-0 block" />
                                {flag}
                              </li>
                            ))
                          ) : (
                            <p className="text-muted-foreground italic flex items-center gap-2">
                              <CheckCircle2 className="h-4 w-4" /> No major red
                              flags detected.
                            </p>
                          )}
                        </ul>
                      </CardContent>
                    </Card>

                    <Card className="border-l-4 border-l-green-500 shadow-sm hover:shadow-md transition-shadow bg-card/50 backdrop-blur-sm">
                      <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-green-500 text-lg">
                          <CheckCircle2 className="h-5 w-5" /> Green Flags
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-3">
                          {result.greenFlags && result.greenFlags.length > 0 ? (
                            result.greenFlags.map((flag, i: number) => (
                              <li
                                key={i}
                                className="flex items-start text-sm text-muted-foreground"
                              >
                                <span className="mr-3 text-green-500 mt-1.5 h-1.5 w-1.5 rounded-full bg-green-500 shrink-0 block" />
                                {flag}
                              </li>
                            ))
                          ) : (
                            <p className="text-muted-foreground italic">
                              No specific green flags noted.
                            </p>
                          )}
                        </ul>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                {/* Tab: Intent */}
                <TabsContent
                  value="intent"
                  className="mt-0 focus-visible:outline-none"
                >
                  <Card className="bg-card/50 backdrop-blur-sm border-primary/20 shadow-lg shadow-primary/5">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-primary" />
                        Subtext Decoder
                      </CardTitle>
                      <CardDescription>
                        What they are really thinking, beyond the words.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="bg-primary/5 p-6 rounded-2xl border border-primary/10">
                        <p className="text-lg md:text-xl leading-relaxed font-medium text-foreground/90 italic">
                          "
                          {result.intent ??
                            result.summary ??
                            "No clear intent detected."}
                          "
                        </p>
                        {/* add below the existing intent block */}
                        {result.summary && (
                          <div className="mt-4 text-sm text-muted-foreground">
                            <strong>Summary: </strong> {result.summary}
                          </div>
                        )}

                        {result.communication_clarity && (
                          <div className="mt-3 text-sm">
                            <strong>Communication clarity:</strong>{" "}
                            {result.communication_clarity.is_clear
                              ? "Clear"
                              : "Unclear"}{" "}
                            — {result.communication_clarity.clarity_reason}
                          </div>
                        )}

                        {(result.behavior_to_impress || []).length > 0 && (
                          <div className="mt-4">
                            <div className="text-sm text-muted-foreground mb-2">
                              Behaviors to emphasize
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {result.behavior_to_impress.map(
                                (b: string, i: number) => (
                                  <div
                                    key={i}
                                    className="px-3 py-1 rounded-full border text-sm"
                                  >
                                    {b}
                                  </div>
                                )
                              )}
                            </div>
                          </div>
                        )}

                        {(result.advice || []).length > 0 && (
                          <div className="mt-4 text-sm">
                            <strong>Advice:</strong>
                            <ul className="list-disc ml-5 mt-2">
                              {result.advice.map((a: string, i: number) => (
                                <li key={i}>{a}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {(result.suggested_followups || []).length > 0 && (
                          <div className="mt-4 text-sm">
                            <strong>Suggested follow-ups:</strong>
                            <div className="flex flex-wrap gap-2 mt-2">
                              {result.suggested_followups.map(
                                (s: string, i: number) => (
                                  <div
                                    key={i}
                                    className="px-3 py-1 rounded-full bg-secondary/10 border text-sm"
                                  >
                                    {s}
                                  </div>
                                )
                              )}
                            </div>
                          </div>
                        )}

                        {result.communication_clarity && (
                          <div className="mt-4 text-sm text-muted-foreground">
                            <div>
                              <strong>Clear communication:</strong>{" "}
                              {result.communication_clarity.is_clear
                                ? "Yes"
                                : "No"}
                            </div>
                            <div>
                              {result.communication_clarity.clarity_reason}
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Tab: Responses */}
                <TabsContent
                  value="responses"
                  className="mt-0 focus-visible:outline-none"
                >
                  <div className="grid gap-5">
                    {/* Suggested messages (full list) */}
                    <Card className="bg-card/50 backdrop-blur-sm">
                      <CardHeader>
                        <CardTitle>Suggested Messages</CardTitle>
                        <CardDescription>
                          Pick one and tweak before sending
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="grid gap-4">
                          {(result.suggested_messages || []).map(
                            (m, i: number) => (
                              <div
                                key={i}
                                className="flex items-center justify-between gap-4 p-4 rounded-lg border hover:shadow-md transition"
                              >
                                <div>
                                  <div className="text-sm font-medium">
                                    {m.tone} • {m.purpose}
                                  </div>
                                  <div className="text-base">{m.text}</div>
                                  {m.why_it_works && (
                                    <div className="text-xs text-muted-foreground mt-1">
                                      {m.why_it_works}
                                    </div>
                                  )}
                                </div>
                                <div className="flex items-center gap-2">
                                  <Button
                                    variant="ghost"
                                    onClick={() => copyText(m.text)}
                                  >
                                    <Copy className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            )
                          )}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Generated quick replies (Safe/Bold/Witty) */}
                    <div className="grid md:grid-cols-3 gap-4">
                      {(result.responses || []).map((resp, i: number) => (
                        <Card
                          key={i}
                          className="hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 transition-all cursor-pointer group bg-card/50 backdrop-blur-sm"
                          onClick={() => {
                            copyText(resp.text);
                          }}
                        >
                          <CardContent className="p-6">
                            <div className="flex justify-between items-center mb-3">
                              <span
                                className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide border
                                ${
                                  resp.tone === "Safe"
                                    ? "bg-blue-500/10 text-blue-600 border-blue-200"
                                    : resp.tone === "Bold"
                                    ? "bg-red-500/10 text-red-600 border-red-200"
                                    : "bg-purple-500/10 text-purple-600 border-purple-200"
                                }`}
                              >
                                {resp.tone === "Safe" && (
                                  <Shield className="h-3 w-3" />
                                )}
                                {resp.tone === "Bold" && (
                                  <Zap className="h-3 w-3" />
                                )}
                                {resp.tone === "Witty" && (
                                  <Sparkles className="h-3 w-3" />
                                )}
                                {resp.tone}
                              </span>
                              <div className="h-8 w-8 rounded-full flex items-center justify-center transition-colors group-hover:bg-primary/10">
                                <Copy className="h-4 w-4 text-muted-foreground/50 group-hover:text-primary transition-colors" />
                              </div>
                            </div>
                            <p className="text-lg text-foreground/90 leading-relaxed">
                              {resp.text}
                            </p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                </TabsContent>

                {/* Extra panels: Message reviews */}
                <TabsContent
                  value="overview"
                  className="mt-0 focus-visible:outline-none"
                >
                  {/* show message reviews below the overview for quick access */}
                  {result.message_reviews &&
                    result.message_reviews.length > 0 && (
                      <Card className="mt-6 bg-card/50">
                        <CardHeader>
                          <CardTitle>Representative Messages</CardTitle>
                          <CardDescription>
                            Which lines matter and how to rewrite them
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="grid gap-3">
                            {result.message_reviews.map((m, idx: number) => (
                              <div key={idx} className="p-3 border rounded-md">
                                <div className="flex justify-between items-start gap-3">
                                  <div>
                                    <div className="text-xs text-muted-foreground mb-2">
                                      Message
                                    </div>
                                    <div className="text-base">{m.text}</div>
                                  </div>
                                  <div className="text-right">
                                    <div className="text-xs text-muted-foreground mb-2">
                                      Rewrite
                                    </div>
                                    <div className="text-sm font-medium">
                                      {m.improvement}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    )}
                </TabsContent>
              </Tabs>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatAnalyzer;
