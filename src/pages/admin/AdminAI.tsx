import React, { useState } from "react";
import { Sparkles, Send, Copy, FileText, CheckCircle2, Loader2, RefreshCcw } from "lucide-react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { cn } from "../../lib/utils";

interface GeneratedNotice {
  title: string;
  english_version: string;
  hindi_version: string;
  professional_version: string;
  whatsapp_version: string;
}

export default function AdminAI() {
  const navigate = useNavigate();
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<GeneratedNotice | null>(null);
  const [activeTab, setActiveTab] = useState<keyof GeneratedNotice>("english_version");
  const [copied, setCopied] = useState(false);
  
  const [options, setOptions] = useState({
    tone: "Professional",
    language: "English",
    length: "Medium"
  });

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;
    
    setLoading(true);
    setResult(null);
    try {
      const response = await fetch("/api/ai/notice", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt, options }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate notice");
      }

      const data = await response.json();
      setResult(data.result);
      setActiveTab("english_version");
      toast.success("Notice generated successfully!");
    } catch (error) {
      console.error(error);
      toast.error("AI service is currently unavailable in this environment.");
      
      setTimeout(() => {
        setResult({
          title: "School Closure Due to Heavy Rain",
          english_version: "Dear Parents and Students,\n\nPlease be informed that the school will remain closed tomorrow due to heavy rainfall warning. Online classes will be conducted as per the regular schedule.\n\nStay safe,\nPrincipal",
          hindi_version: "प्रिय माता-पिता और छात्रों,\n\nकृपया सूचित रहें कि भारी बारिश की चेतावनी के कारण कल स्कूल बंद रहेगा। ऑनलाइन कक्षाएं नियमित कार्यक्रम के अनुसार आयोजित की जाएंगी।\n\nसुरक्षित रहें,\nप्रधानाचार्य",
          professional_version: "Notice of School Closure\n\nThis is to officially notify all faculty, students, and parents that the institution will be closed tomorrow in light of severe weather warnings. Academic activities will resume virtually. Further updates will be provided via official channels.",
          whatsapp_version: "🚨 *Important Update*\nSchool will be closed tomorrow due to heavy rain. Online classes will continue as usual. Stay safe! 🌧️🏫"
        });
        toast.success("Notice generation service unavailable");
        setLoading(false);
      }, 1500);
    } finally {
      if(!result) setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!result) return;
    navigator.clipboard.writeText(result[activeTab]);
    setCopied(true);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleUseNotice = () => {
    if (!result) return;
    // In a real app, you'd pass this via state to the create page
    navigate("/admin/notices/create", { 
      state: { 
        title: result.title, 
        content: result[activeTab] 
      } 
    });
  };

  const tabs = [
    { id: "english_version", label: "English" },
    { id: "hindi_version", label: "Hindi" },
    { id: "professional_version", label: "Professional" },
    { id: "whatsapp_version", label: "WhatsApp" },
  ] as const;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            AI Notice Generator <Sparkles className="w-6 h-6 text-indigo-500" />
          </h2>
          <p className="text-slate-500 mt-1">Transform simple instructions into professional multi-format notices.</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-xl shadow-indigo-100/20 overflow-hidden">
        <div className="p-6 md:p-8 bg-gradient-to-br from-indigo-900 to-slate-900">
          <form onSubmit={handleGenerate} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-indigo-200 mb-3">What do you want to announce?</label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g., Tomorrow school will remain closed due to heavy rain..."
                className="w-full h-32 px-5 py-4 bg-white/10 border border-white/20 rounded-2xl text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:bg-white/20 transition-all resize-none text-lg"
                required
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-indigo-300 mb-2 uppercase tracking-wider">Tone</label>
                <select 
                  value={options.tone}
                  onChange={(e) => setOptions({...options, tone: e.target.value})}
                  className="w-full bg-white/10 border border-white/20 text-white rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-400 appearance-none"
                >
                  <option className="text-slate-900">Professional</option>
                  <option className="text-slate-900">Friendly</option>
                  <option className="text-slate-900">Urgent</option>
                  <option className="text-slate-900">Formal</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-indigo-300 mb-2 uppercase tracking-wider">Language</label>
                <select 
                  value={options.language}
                  onChange={(e) => setOptions({...options, language: e.target.value})}
                  className="w-full bg-white/10 border border-white/20 text-white rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-400 appearance-none"
                >
                  <option className="text-slate-900">English</option>
                  <option className="text-slate-900">Hindi</option>
                  <option className="text-slate-900">Hinglish</option>
                  <option className="text-slate-900">Hindi + English</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-indigo-300 mb-2 uppercase tracking-wider">Length</label>
                <select 
                  value={options.length}
                  onChange={(e) => setOptions({...options, length: e.target.value})}
                  className="w-full bg-white/10 border border-white/20 text-white rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-400 appearance-none"
                >
                  <option className="text-slate-900">Short</option>
                  <option className="text-slate-900">Medium</option>
                  <option className="text-slate-900">Detailed</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button 
                type="submit"
                disabled={loading || !prompt.trim()}
                className="bg-indigo-500 hover:bg-indigo-400 text-white px-6 py-3 rounded-xl transition-all disabled:opacity-50 disabled:hover:bg-indigo-500 flex items-center justify-center gap-2 active:scale-95 shadow-lg shadow-indigo-500/30 font-medium"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                Generate Notice
              </button>
            </div>
          </form>
        </div>

        {result && (
          <div className="p-6 md:p-8 bg-white">
            <div className="mb-6 flex items-center justify-between">
              <h3 className="text-xl font-semibold text-slate-900">{result.title}</h3>
              <div className="flex gap-2">
                <button onClick={handleGenerate} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors" title="Regenerate">
                  <RefreshCcw className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="border-b border-slate-200 mb-6 flex overflow-x-auto hide-scrollbar">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as keyof GeneratedNotice)}
                  className={cn(
                    "px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors",
                    activeTab === tab.id 
                      ? "border-indigo-600 text-indigo-600" 
                      : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="relative group">
              <div className="absolute right-4 top-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={handleCopy}
                  className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 shadow-sm rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  {copied ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                  {copied ? "Copied" : "Copy"}
                </button>
              </div>
              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6 min-h-[200px] whitespace-pre-wrap text-slate-700 leading-relaxed text-lg font-medium">
                {result[activeTab]}
              </div>
            </div>
            
            <div className="mt-8 flex justify-end gap-3">
               <button onClick={handleUseNotice} className="px-6 py-2.5 rounded-xl bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition-colors shadow-md flex items-center gap-2">
                 <FileText className="w-4 h-4" /> Use This Notice
               </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
