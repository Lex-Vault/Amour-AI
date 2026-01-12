import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Loader2,
  Wand2,
  Copy,
  Check,
  ArrowLeft,
  Sparkles,
  User,
  Briefcase,
  Heart,
  Coins,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { generateBios } from "@/services/ai";
const BioGenerator = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, fetchUser } = useAuth();

  const [formData, setFormData] = useState({
    hobbies: "",
    vibe: "",
    job: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleGenerate = async () => {
    if (!formData.hobbies || !formData.vibe) {
      toast({
        title: "Missing Info",
        description: "Please fill in your hobbies and vibe.",
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
      if(user.credits <1){
        toast({
          title: "Insufficient Credits",
          description: "Please buy credits to generate bios.",
          variant: "destructive",
        });
        return;
      }
      const data = await generateBios(formData);
      fetchUser();
      setResult(data);
      toast({ title: "Success", description: "Fresh bios generated!" });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate bios.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    fetchUser();
  }, []);
  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
    toast({ title: "Copied", description: "Bio copied to clipboard." });
  };

  return (
    <div className="min-h-screen bg-background relative selection:bg-primary/20 overflow-x-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 -left-40 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 -right-40 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

      <div className="container mx-auto pt-20 py-6 px-4 max-w-5xl relative z-10">
        {/* Top Bar with Nav and Credits */}
        <div className="flex justify-between items-center mb-20">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="group pl-0 hover:bg-transparent text-muted-foreground hover:text-primary transition-colors"
          >
            <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            Back to Tools
          </Button>

          {/* Credits (pinned on md+) */}
          <div className="flex items-center gap-2">
            {/* On md+ this wrapper becomes fixed in the top-right */}
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

            {/* For small screens keep inline so it doesn't cover content */}
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
            <Sparkles className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">
            Bio Architect
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Stop overthinking. Let AI craft the perfect introduction on who you
            actually are.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Input Form */}
          <div className="space-y-8">
            <Card className="border-muted/40 shadow-xl shadow-primary/5 bg-card/50 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-xl">
                  <User className="h-5 w-5 text-primary" />
                  Your Profile Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2.5">
                  <Label
                    htmlFor="hobbies"
                    className="text-sm font-medium flex items-center gap-2"
                  >
                    <Heart className="h-4 w-4 text-rose-500" /> Hobbies &
                    Interests
                  </Label>
                  <Textarea
                    id="hobbies"
                    placeholder="e.g. Hiking, Sci-Fi movies, Cooking spicy food, playing Guitar"
                    value={formData.hobbies}
                    onChange={(e) =>
                      setFormData({ ...formData, hobbies: e.target.value })
                    }
                    className="min-h-[100px] resize-none bg-background/50 focus:bg-background transition-colors border-muted-foreground/20 focus:border-primary/50"
                  />
                </div>

                <div className="space-y-2.5">
                  <Label
                    htmlFor="job"
                    className="text-sm font-medium flex items-center gap-2"
                  >
                    <Briefcase className="h-4 w-4 text-blue-500" /> Job / Career{" "}
                    <span className="text-muted-foreground text-xs font-normal ml-auto">
                      (Optional)
                    </span>
                  </Label>
                  <Input
                    id="job"
                    placeholder="e.g. Software Engineer / Startup Founder"
                    value={formData.job}
                    onChange={(e) =>
                      setFormData({ ...formData, job: e.target.value })
                    }
                    className="h-11 bg-background/50 focus:bg-background transition-colors border-muted-foreground/20 focus:border-primary/50"
                  />
                </div>

                <div className="space-y-2.5">
                  <Label
                    htmlFor="vibe"
                    className="text-sm font-medium flex items-center gap-2"
                  >
                    <Sparkles className="h-4 w-4 text-yellow-500" /> Your Vibe
                  </Label>
                  <Input
                    id="vibe"
                    placeholder="e.g. Chill, Ambitious, Witty, Sarcastic"
                    value={formData.vibe}
                    onChange={(e) =>
                      setFormData({ ...formData, vibe: e.target.value })
                    }
                    className="h-11 bg-background/50 focus:bg-background transition-colors border-muted-foreground/20 focus:border-primary/50"
                  />
                </div>

                <Button
                  onClick={handleGenerate}
                  disabled={isLoading}
                  className="w-full h-14 text-lg font-medium shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all rounded-xl mt-2"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Crafting
                      Persona...
                    </>
                  ) : (
                    <>
                      <Wand2 className="mr-2 h-5 w-5" /> Generate Bios
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Results Display */}
          <div className="space-y-6">
            <div className="flex items-center justify-between pb-2">
              <h2 className="text-2xl font-bold">Results</h2>
              {result && (
                <span className="text-sm text-muted-foreground">
                  Click to copy
                </span>
              )}
            </div>

            {!result && !isLoading && (
              <div className="h-[450px] border-2 border-dashed border-muted-foreground/10 rounded-3xl flex flex-col items-center justify-center text-muted-foreground p-8 text-center bg-card/30 backdrop-blur-sm">
                <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
                  <Wand2 className="h-8 w-8 opacity-40" />
                </div>
                <h3 className="text-lg font-semibold mb-1">Ready to Create</h3>
                <p className="max-w-xs text-sm opacity-80">
                  Fill out the form and hit generate to see your new personas
                  appear here.
                </p>
              </div>
            )}

            {isLoading && (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-32 bg-muted/20 animate-pulse rounded-2xl border border-muted/20"
                  />
                ))}
              </div>
            )}

            {result && (
              <div className="space-y-4 animate-in fade-in slide-in-from-right-8 duration-500">
                {result.bios.map((bio, index) => (
                  <Card
                    key={index}
                    className="group hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 cursor-pointer relative overflow-hidden bg-card/80 backdrop-blur-sm border-muted/40"
                    onClick={() => copyToClipboard(bio.text, index)}
                  >
                    {/* Tone indicator bar */}
                    <div
                      className={`absolute top-0 left-0 w-1.5 h-full transition-all duration-300 group-hover:w-2
                       ${
                         bio.tone === "Funny"
                           ? "bg-yellow-400"
                           : bio.tone === "Mysterious"
                           ? "bg-purple-500"
                           : "bg-blue-500"
                       }`}
                    />

                    <CardContent className="pt-6 pl-8 pr-6 pb-6">
                      <div className="flex justify-between items-start mb-4">
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border bg-background/50
                            ${
                              bio.tone === "Funny"
                                ? "text-yellow-600 border-yellow-200"
                                : bio.tone === "Mysterious"
                                ? "text-purple-600 border-purple-200"
                                : "text-blue-600 border-blue-200"
                            }
                         `}
                        >
                          {bio.tone}
                        </span>
                        <div className="h-8 w-8 rounded-full flex items-center justify-center transition-colors group-hover:bg-primary/10">
                          {copiedIndex === index ? (
                            <Check className="h-4 w-4 text-green-500 scale-110 transition-transform" />
                          ) : (
                            <Copy className="h-4 w-4 text-muted-foreground opacity-50 group-hover:opacity-100 transition-opacity" />
                          )}
                        </div>
                      </div>
                      <p className="text-lg font-medium leading-relaxed text-foreground/90">
                        "{bio.text}"
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BioGenerator;
