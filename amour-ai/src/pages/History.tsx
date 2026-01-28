import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getHistory, HistoryItem, HistoryType } from "@/services/ai";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Camera,
  MessageSquareText,
  ImageIcon,
  Sparkles,
  ArrowLeft,
  Clock,
  ChevronRight,
  Loader2,
} from "lucide-react";

interface CategoryCard {
  type: HistoryType;
  title: string;
  icon: React.ReactNode;
  gradient: string;
  description: string;
}

const categories: CategoryCard[] = [
  {
    type: "profile_analysis",
    title: "DP Analyzer",
    icon: <Camera className="w-8 h-8" />,
    gradient: "from-purple-600 to-pink-600",
    description: "Profile photo analysis results",
  },
  {
    type: "chat_image_analysis",
    title: "Chat Image Analyzer",
    icon: <ImageIcon className="w-8 h-8" />,
    gradient: "from-blue-600 to-cyan-600",
    description: "Chat screenshot analysis",
  },
  {
    type: "chat_analysis",
    title: "Text Chat Analyzer",
    icon: <MessageSquareText className="w-8 h-8" />,
    gradient: "from-orange-600 to-red-600",
    description: "Text chat analysis results",
  },
  {
    type: "bio",
    title: "Bio Generator",
    icon: <Sparkles className="w-8 h-8" />,
    gradient: "from-emerald-600 to-teal-600",
    description: "Generated dating bios",
  },
];

const History = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [historyByType, setHistoryByType] = useState<
    Record<HistoryType, HistoryItem[]>
  >({
    profile_analysis: [],
    chat_image_analysis: [],
    chat_analysis: [],
    bio: [],
  });
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<HistoryItem | null>(null);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    fetchAllHistory();
  }, [user]);

  const fetchAllHistory = async () => {
    setLoading(true);
    try {
      const allHistory = await getHistory(undefined, 100);
      const grouped: Record<HistoryType, HistoryItem[]> = {
        profile_analysis: [],
        chat_image_analysis: [],
        chat_analysis: [],
        bio: [],
      };
      allHistory.forEach((item) => {
        if (grouped[item.type]) {
          grouped[item.type].push(item);
        }
      });
      setHistoryByType(grouped);
    } catch (error) {
      console.error("Failed to fetch history:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getItemSummary = (item: HistoryItem): string => {
    switch (item.type) {
      case "bio":
        const input = item.input as { hobbies?: string; vibe?: string };
        return `${input.hobbies || "N/A"} • ${input.vibe || "N/A"}`;
      case "chat_analysis":
        const chatInput = item.input as { chatText?: string };
        const text = chatInput.chatText || "";
        return text.slice(0, 50) + (text.length > 50 ? "..." : "");
      case "profile_analysis":
      case "chat_image_analysis":
        return "Image analysis";
      default:
        return "Generation";
    }
  };

  const renderOutputPreview = (item: HistoryItem) => {
    const output = item.output as Record<string, unknown>;

    if (item.type === "bio" && output.bios) {
      const bios = output.bios as Array<{ tone: string; text: string }>;
      return (
        <div className="space-y-4">
          {bios.map((bio, idx) => (
            <div key={idx} className="p-4 bg-white/5 rounded-xl">
              <span className="text-xs font-semibold text-orange-400 uppercase tracking-wider">
                {bio.tone}
              </span>
              <p className="mt-2 text-gray-300">{bio.text}</p>
            </div>
          ))}
        </div>
      );
    }

    if (
      (item.type === "chat_analysis" || item.type === "chat_image_analysis") &&
      output
    ) {
      const subscores = output.subscores as Record<string, number> | undefined;
      const redFlags = output.redFlags as string[] | undefined;
      const greenFlags = output.greenFlags as string[] | undefined;
      const responses = output.responses as Array<{ tone: string; text: string }> | undefined;
      const advice = output.advice as string[] | undefined;

      return (
        <div className="space-y-4">
          {/* Love Meter */}
          {output.love_meter !== undefined && (
            <div className="p-4 bg-gradient-to-r from-pink-500/20 to-red-500/20 rounded-xl">
              <span className="text-sm text-gray-400">Love Meter</span>
              <p className="text-3xl font-bold text-pink-400">
                {output.love_meter as number}%
              </p>
            </div>
          )}

          {/* Subscores */}
          {subscores && (
            <div className="p-4 bg-white/5 rounded-xl">
              <span className="text-sm text-gray-400 block mb-3">Subscores</span>
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(subscores).map(([key, value]) => (
                  <div key={key} className="flex justify-between items-center">
                    <span className="text-xs text-gray-500 capitalize">{key.replace("_", " ")}</span>
                    <span className="text-sm font-semibold text-white">{value}/10</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Intent */}
          {output.intent && (
            <div className="p-4 bg-white/5 rounded-xl">
              <span className="text-sm text-gray-400">Intent</span>
              <p className="mt-1 text-gray-300 font-medium">{output.intent as string}</p>
            </div>
          )}

          {/* Summary */}
          {output.summary && (
            <div className="p-4 bg-white/5 rounded-xl">
              <span className="text-sm text-gray-400">Summary</span>
              <p className="mt-1 text-gray-300">{output.summary as string}</p>
            </div>
          )}

          {/* Red Flags & Green Flags */}
          <div className="grid grid-cols-2 gap-4">
            {redFlags && redFlags.length > 0 && (
              <div className="p-4 bg-red-500/10 rounded-xl">
                <span className="text-sm text-red-400">🚩 Red Flags</span>
                <ul className="mt-2 space-y-1">
                  {redFlags.map((flag, idx) => (
                    <li key={idx} className="text-gray-300 text-sm">• {flag}</li>
                  ))}
                </ul>
              </div>
            )}
            {greenFlags && greenFlags.length > 0 && (
              <div className="p-4 bg-emerald-500/10 rounded-xl">
                <span className="text-sm text-emerald-400">✅ Green Flags</span>
                <ul className="mt-2 space-y-1">
                  {greenFlags.map((flag, idx) => (
                    <li key={idx} className="text-gray-300 text-sm">• {flag}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Suggested Responses */}
          {responses && responses.length > 0 && (
            <div className="p-4 bg-white/5 rounded-xl">
              <span className="text-sm text-gray-400 block mb-3">Suggested Responses</span>
              <div className="space-y-3">
                {responses.map((resp, idx) => (
                  <div key={idx} className="p-3 bg-white/5 rounded-lg">
                    <span className="text-xs font-semibold text-blue-400 uppercase">{resp.tone}</span>
                    <p className="mt-1 text-gray-300 text-sm">{resp.text}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Advice */}
          {advice && advice.length > 0 && (
            <div className="p-4 bg-white/5 rounded-xl">
              <span className="text-sm text-gray-400">💡 Advice</span>
              <ul className="mt-2 space-y-2">
                {advice.map((tip, idx) => (
                  <li key={idx} className="text-gray-300 text-sm">• {tip}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Suggested Messages */}
          {output.suggested_messages &&
            Array.isArray(output.suggested_messages) &&
            (output.suggested_messages as string[]).length > 0 && (
              <div className="p-4 bg-white/5 rounded-xl">
                <span className="text-sm text-gray-400">Suggested Messages</span>
                <ul className="mt-2 space-y-2">
                  {(output.suggested_messages as string[]).map((msg, idx) => (
                    <li key={idx} className="text-gray-300 text-sm">
                      • {msg}
                    </li>
                  ))}
                </ul>
              </div>
            )}
        </div>
      );
    }

    if (item.type === "profile_analysis" && output) {
      const subscores = output.subscores as Record<string, number> | undefined;
      const priorityIssues = output.priority_issues as string[] | undefined;
      const suggestions = output.suggestions as string[] | undefined;
      const quickTips = output.quick_tips as string[] | undefined;
      const tags = output.tags as string[] | undefined;

      return (
        <div className="space-y-4">
          {/* Photo Score */}
          {output.score !== undefined && (
            <div className="p-4 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-xl">
              <span className="text-sm text-gray-400">Photo Score</span>
              <p className="text-3xl font-bold text-purple-400">
                {output.score as number}/10
              </p>
              {output.person_confidence !== undefined && (
                <p className="text-xs text-gray-500 mt-1">
                  Confidence: {output.person_confidence as number}/10
                </p>
              )}
            </div>
          )}

          {/* Subscores */}
          {subscores && (
            <div className="p-4 bg-white/5 rounded-xl">
              <span className="text-sm text-gray-400 block mb-3">Subscores</span>
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(subscores).map(([key, value]) => (
                  <div key={key} className="flex justify-between items-center">
                    <span className="text-xs text-gray-500 capitalize">{key}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-2 bg-white/10 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                          style={{ width: `${(value / 10) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm font-semibold text-white w-8">{value}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Priority Issues */}
          {priorityIssues && priorityIssues.length > 0 && (
            <div className="p-4 bg-orange-500/10 rounded-xl">
              <span className="text-sm text-orange-400">⚠️ Priority Issues</span>
              <ul className="mt-2 space-y-1">
                {priorityIssues.map((issue, idx) => (
                  <li key={idx} className="text-gray-300 text-sm">{idx + 1}. {issue}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Pros & Cons */}
          <div className="grid grid-cols-2 gap-4">
            {output.pros && Array.isArray(output.pros) && (
              <div className="p-4 bg-emerald-500/10 rounded-xl">
                <span className="text-sm text-emerald-400">✓ Pros</span>
                <ul className="mt-2 space-y-1">
                  {(output.pros as string[]).map((pro, idx) => (
                    <li key={idx} className="text-gray-300 text-sm">
                      • {pro}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {output.cons && Array.isArray(output.cons) && (
              <div className="p-4 bg-red-500/10 rounded-xl">
                <span className="text-sm text-red-400">✗ Cons</span>
                <ul className="mt-2 space-y-1">
                  {(output.cons as string[]).map((con, idx) => (
                    <li key={idx} className="text-gray-300 text-sm">
                      • {con}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Suggestions */}
          {suggestions && suggestions.length > 0 && (
            <div className="p-4 bg-white/5 rounded-xl">
              <span className="text-sm text-blue-400">📸 Suggestions</span>
              <ul className="mt-2 space-y-2">
                {suggestions.map((suggestion, idx) => (
                  <li key={idx} className="text-gray-300 text-sm">
                    {idx + 1}. {suggestion}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Quick Tips */}
          {quickTips && quickTips.length > 0 && (
            <div className="p-4 bg-white/5 rounded-xl">
              <span className="text-sm text-yellow-400">💡 Quick Tips</span>
              <ul className="mt-2 space-y-1">
                {quickTips.map((tip, idx) => (
                  <li key={idx} className="text-gray-300 text-sm">• {tip}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Tags */}
          {tags && tags.length > 0 && (
            <div className="p-4 bg-white/5 rounded-xl">
              <span className="text-sm text-gray-400">Tags</span>
              <div className="flex flex-wrap gap-2 mt-2">
                {tags.map((tag, idx) => (
                  <span key={idx} className="px-2 py-1 bg-white/10 rounded-full text-xs text-gray-300">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      );
    }

    return (
      <pre className="text-sm text-gray-400 bg-white/5 p-4 rounded-xl overflow-auto">
        {JSON.stringify(output, null, 2)}
      </pre>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#020202] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020202] text-white">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-[#020202]/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/")}
            className="text-gray-400 hover:text-white"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">
              Generation History
            </h1>
            <p className="text-sm text-gray-500">
              Your past AI generations (last 48 hours)
            </p>
          </div>
        </div>
      </div>

      {/* Category Cards */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {categories.map((category) => {
            const items = historyByType[category.type];
            return (
              <Card
                key={category.type}
                className="bg-white/5 border-white/10 overflow-hidden group hover:border-white/20 transition-all duration-300"
              >
                <CardHeader
                  className={`bg-gradient-to-r ${category.gradient} p-6`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-white/20 rounded-xl">
                        {category.icon}
                      </div>
                      <div>
                        <CardTitle className="text-xl text-white">
                          {category.title}
                        </CardTitle>
                        <p className="text-sm text-white/70">
                          {category.description}
                        </p>
                      </div>
                    </div>
                    <span className="px-3 py-1 bg-white/20 rounded-full text-sm font-semibold">
                      {items.length}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  {items.length === 0 ? (
                    <div className="p-6 text-center text-gray-500">
                      <p>No history yet</p>
                      <p className="text-sm mt-1">
                        Start using this tool to see results here
                      </p>
                    </div>
                  ) : (
                    <ScrollArea className="h-[200px]">
                      <div className="divide-y divide-white/5">
                        {items.slice(0, 10).map((item) => (
                          <button
                            key={item._id}
                            onClick={() => setSelectedItem(item)}
                            className="w-full p-4 flex items-center justify-between hover:bg-white/5 transition-colors text-left"
                          >
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-gray-300 truncate">
                                {getItemSummary(item)}
                              </p>
                              <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                                <Clock className="w-3 h-3" />
                                {formatDate(item.createdAt)}
                              </p>
                            </div>
                            <ChevronRight className="w-4 h-4 text-gray-500" />
                          </button>
                        ))}
                      </div>
                    </ScrollArea>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Detail Dialog */}
      <Dialog open={!!selectedItem} onOpenChange={() => setSelectedItem(null)}>
        <DialogContent className="bg-[#0a0a0a] border-white/10 text-white max-w-2xl max-h-[80vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="text-xl">
              {selectedItem &&
                categories.find((c) => c.type === selectedItem.type)?.title}
            </DialogTitle>
            {selectedItem && (
              <p className="text-sm text-gray-500">
                {formatDate(selectedItem.createdAt)}
              </p>
            )}
          </DialogHeader>
          <ScrollArea className="max-h-[60vh] pr-4">
            {selectedItem && renderOutputPreview(selectedItem)}
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default History;
