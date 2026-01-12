import { useState, useRef, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  X,
  Loader2,
  Camera,
  CheckCircle2,
  AlertOctagon,
  UploadCloud,
  ArrowLeft,
  Coins,
  Zap,
  Lightbulb,
  TrendingUp,
  Tag,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { analyzeDp } from "@/services/ai";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

const compressImage = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const MAX_WIDTH = 800;
        const scale = MAX_WIDTH / img.width;
        const finalScale = scale < 1 ? scale : 1;
        canvas.width = img.width * finalScale;
        canvas.height = img.height * finalScale;
        const ctx = canvas.getContext("2d");
        if (!ctx) return reject("Canvas error");
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const compressed = canvas.toDataURL("image/jpeg", 0.7);
        resolve(compressed);
      };
      img.onerror = () => reject("Image load error");
    };
    reader.onerror = () => reject("File read error");
    reader.readAsDataURL(file);
  });
};


const DpAnalyzer = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user, fetchUser } = useAuth();

  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    fetchUser();
  }, []);
  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const compressed = await compressImage(file);
      setSelectedImage(compressed);
      setResult(null);
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to process image.",
        variant: "destructive",
      });
    }
  };

  const handleAnalyze = async () => {
    if (!selectedImage) return;

    setIsAnalyzing(true);
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
          description: "Please buy credits to analyze photos.",
          variant: "destructive",
        });
        return;
      }
      const data = await analyzeDp(selectedImage);
      fetchUser();
      setResult(data);
      toast({
        title: "Analysis Complete",
        description: "Your photo has been audited.",
      });
    } catch (error) {
      console.error(error);
      const message = error.message?.includes("400")
        ? "Image too complex or API rejected the input."
        : "Failed to analyze image.";
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const triggerUpload = () => fileInputRef.current?.click();

  const clearImage = () => {
    setSelectedImage(null);
    setResult(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-background/50 relative selection:bg-primary/20 overflow-x-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 -left-40 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 -right-40 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="container mx-auto pt-20 py-6 px-4 max-w-6xl relative z-10">
        {/* Top Bar */}
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
        <div className="text-center mb-16 space-y-4">
          <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-primary/10 mb-4 ring-1 ring-primary/20">
            <Camera className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">
            Profile Picture Audit
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            First impressions happen in milliseconds. Upload your photo to get
            an objective, AI-powered analysis.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 items-start">
          {/* LEFT COLUMN: Upload Area */}
          <div className="w-full">
            <div
              className={`relative group rounded-3xl border-2 border-dashed transition-all duration-300 overflow-hidden bg-card/50 backdrop-blur-sm ${
                selectedImage
                  ? "border-primary/50 shadow-2xl shadow-primary/10"
                  : "border-muted-foreground/20 hover:border-primary/50 hover:bg-card/80"
              }`}
            >
              <div className="aspect-[4/5] md:aspect-square w-full relative flex flex-col items-center justify-center p-2">
                {selectedImage ? (
                  <>
                    <img
                      src={selectedImage}
                      alt="Preview"
                      className="w-full h-full object-contain rounded-2xl animate-in fade-in zoom-in-95 duration-500"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-2xl backdrop-blur-[2px]">
                      <Button
                        size="lg"
                        variant="destructive"
                        className="rounded-full shadow-lg scale-90 group-hover:scale-100 transition-transform"
                        onClick={clearImage}
                      >
                        <X className="h-5 w-5 mr-2" />
                        Remove Photo
                      </Button>
                    </div>
                  </>
                ) : (
                  <div
                    className="w-full h-full flex flex-col items-center justify-center cursor-pointer p-8 text-center space-y-6"
                    onClick={triggerUpload}
                  >
                    <div className="w-20 h-20 rounded-full bg-primary/5 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <UploadCloud className="h-10 w-10 text-primary/70" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-xl font-semibold">Click to upload</h3>
                      <p className="text-sm text-muted-foreground">
                        or drag and drop your best shot
                      </p>
                    </div>
                    <div className="text-xs text-muted-foreground/60 bg-muted/50 px-3 py-1 rounded-full">
                      JPG, PNG up to 5MB
                    </div>
                  </div>
                )}
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={handleFileSelect}
                />
              </div>
            </div>

            {selectedImage && !result && (
              <Button
                onClick={handleAnalyze}
                disabled={isAnalyzing}
                size="lg"
                className="w-full mt-6 h-14 text-lg font-medium shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all rounded-xl"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Scanning Pixels...
                  </>
                ) : (
                  "Run Analysis"
                )}
              </Button>
            )}
          </div>

          {/* RIGHT COLUMN: Results Dashboard */}
          <div className="space-y-6 max-h-[80vh] overflow-y-scroll [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] pr-4">
            {!result ? (
              <Card className="h-full border-muted/40 bg-card/30 backdrop-blur-sm">
                <CardContent className="h-full flex flex-col items-center justify-center text-center p-12 space-y-4 opacity-60">
                  <AlertOctagon className="h-8 w-8 text-muted-foreground" />
                  <h3 className="text-xl font-semibold">No Data Yet</h3>
                  <p className="text-muted-foreground max-w-xs">
                    Upload a photo to reveal your score and detailed analysis.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6 animate-in slide-in-from-bottom-8 duration-700 fade-in">
                {/* Score Card */}
                <Card className="overflow-hidden border-none shadow-2xl bg-gradient-to-br from-primary via-primary/90 to-blue-600 text-primary-foreground relative">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10" />
                  <CardContent className="p-8 relative z-10">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <p className="text-primary-foreground/80 font-medium mb-1">
                          Overall Impact Score
                        </p>
                        <h2 className="text-6xl font-bold tracking-tighter">
                          {result.score}
                          <span className="text-3xl opacity-60">/10</span>
                        </h2>
                      </div>
                      <div className="h-20 w-20 rounded-full border-4 border-white/20 flex items-center justify-center backdrop-blur-sm bg-white/10">
                        <span className="text-2xl">
                          {result.score >= 7
                            ? "✨"
                            : result.score >= 5
                            ? "👍"
                            : "🤔"}
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-primary-foreground/70">
                      Person Confidence:{" "}
                      <span className="font-semibold">
                        {result.person_confidence}/10
                      </span>
                    </p>
                  </CardContent>
                </Card>

                {/* Subscores Grid */}
                <div className="grid grid-cols-2 gap-3">
                  {Object.entries(result.subscores).map(
                    ([category, score]: [string, number]) => (
                      <Card
                        key={category}
                        className="border-none bg-card/80 hover:bg-card transition-colors"
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-sm font-medium capitalize text-muted-foreground">
                              {category}
                            </p>
                            <span className="text-lg font-bold text-primary">
                              {score}/10
                            </span>
                          </div>
                          <div className="w-full bg-muted rounded-full h-2">
                            <div
                              className="bg-gradient-to-r from-primary to-blue-500 h-2 rounded-full transition-all duration-500"
                              style={{ width: `${score * 10}%` }}
                            />
                          </div>
                        </CardContent>
                      </Card>
                    )
                  )}
                </div>

                {/* Priority Issues */}
                {result.priority_issues &&
                  result.priority_issues.length > 0 && (
                    <Card className="border-l-4 border-l-red-500 bg-red-500/5">
                      <CardContent className="p-6">
                        <h3 className="font-semibold text-lg flex items-center mb-4 text-foreground">
                          <Zap className="w-5 h-5 text-red-500 mr-2" />
                          Priority Issues
                        </h3>
                        <div className="space-y-4">
                          {result.priority_issues.map((issue, i) => (
                            <div key={i} className="space-y-2">
                              <p className="text-sm font-medium text-foreground capitalize">
                                • {issue}
                              </p>
                              {result.explainers && result.explainers[i] && (
                                <p className="text-xs text-muted-foreground ml-4 italic">
                                  {result.explainers[i]}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                {/* Quick Tips */}
                {result.quick_tips && result.quick_tips.length > 0 && (
                  <Card className="border-l-4 border-l-yellow-500 bg-yellow-500/5">
                    <CardContent className="p-6">
                      <h3 className="font-semibold text-lg flex items-center mb-4 text-foreground">
                        <Lightbulb className="w-5 h-5 text-yellow-500 mr-2" />
                        Quick Tips
                      </h3>
                      <ul className="space-y-2">
                        {result.quick_tips.map((tip, i) => (
                          <li
                            key={i}
                            className="text-sm text-muted-foreground flex items-start"
                          >
                            <span className="mr-2 text-yellow-500 font-bold">
                              →
                            </span>
                            {tip}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}

                {/* Detailed Suggestions */}
                {result.suggestions && result.suggestions.length > 0 && (
                  <Card className="border-l-4 border-l-blue-500 bg-blue-500/5">
                    <CardContent className="p-6">
                      <h3 className="font-semibold text-lg flex items-center mb-4 text-foreground">
                        <TrendingUp className="w-5 h-5 text-blue-500 mr-2" />
                        Suggestions
                      </h3>
                      <ul className="space-y-3">
                        {result.suggestions.map((suggestion, i) => (
                          <li
                            key={i}
                            className="text-sm text-muted-foreground flex gap-3"
                          >
                            <span className="text-blue-500 font-bold mt-0.5 flex-shrink-0">
                              {i + 1}.
                            </span>
                            <span>{suggestion}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}

                {/* Key Strengths */}
                {result.pros && result.pros.length > 0 && (
                  <Card className="border-l-4 border-l-green-500 bg-green-500/5">
                    <CardContent className="p-6">
                      <h3 className="font-semibold text-lg flex items-center mb-4 text-foreground">
                        <CheckCircle2 className="w-5 h-5 text-green-500 mr-2" />
                        Key Strengths
                      </h3>
                      <ul className="space-y-2">
                        {result.pros.map((pro, i) => (
                          <li
                            key={i}
                            className="text-sm text-muted-foreground flex items-start"
                          >
                            <span className="mr-3 text-green-500 font-bold">
                              ✓
                            </span>
                            {pro}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}

                {/* Room for Growth */}
                {result.cons && result.cons.length > 0 && (
                  <Card className="border-l-4 border-l-amber-500 bg-amber-500/5">
                    <CardContent className="p-6">
                      <h3 className="font-semibold text-lg flex items-center mb-4 text-foreground">
                        <AlertOctagon className="w-5 h-5 text-amber-500 mr-2" />
                        Room for Growth
                      </h3>
                      <ul className="space-y-2">
                        {result.cons.map((con, i) => (
                          <li
                            key={i}
                            className="text-sm text-muted-foreground flex items-start"
                          >
                            <span className="mr-3 text-amber-500">•</span>
                            {con}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}

                {/* Tags */}
                {result.tags && result.tags.length > 0 && (
                  <Card className="border-none bg-card/80">
                    <CardContent className="p-6">
                      <h3 className="font-semibold text-lg flex items-center mb-4 text-foreground">
                        <Tag className="w-5 h-5 text-muted-foreground mr-2" />
                        Photo Tags
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {result.tags.map((tag, i) => (
                          <span
                            key={i}
                            className="px-3 py-1 rounded-full bg-primary/10 text-secondary text-sm font-medium"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                <Button
                  variant="outline"
                  className="w-full border-dashed"
                  onClick={clearImage}
                >
                  Analyze Another Photo
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DpAnalyzer;
