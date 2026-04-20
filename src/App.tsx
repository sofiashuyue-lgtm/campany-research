import { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from '@google/genai';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Building2, Briefcase, Search, AlertCircle, Sparkles, Loader2, BookOpen, Layers } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function App() {
  const [company, setCompany] = useState('');
  const [businessLine, setBusinessLine] = useState('');
  const [position, setPosition] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [report, setReport] = useState<string | null>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  const generateReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!company.trim() || !position.trim() || !businessLine.trim()) return;

    setLoading(true);
    setError(null);
    setReport('');

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      
      const prompt = `你现在是一位资深的求职指导专家和行业分析师。用户即将在“${company}”的“${businessLine}”业务线/领域，面试“${position}”岗位。
请你利用网络搜索工具，快速调研该公司的最新情况，并向用户提供一份高度结构化、客观专业的面试前调研报告。

请务必严格按照以下5个模块输出（需要带合适的标题和分段，内容详实且客观）：
1. **核心财务与发展分析**：如果能找到财报或可查询的财务信息，列出核心财务指标，分析近年发展情况和速度。
2. **业务与市场分析**：列出公司跨部门主要产品、服务，以及具体在“${businessLine}”相关业务的表现及市场占有率。
3. **团队与组织规模**：查找公司人员规模、分部情况等基础信息。
4. **互联网风评与口碑**：查找互联网对该公司各方面评价（如知乎、脉脉、小红书等网站的员工或面经反馈。好坏均要列出）。
5. **岗位与业务深度解析**：分析在“${businessLine}”领域内，“${position}”这一职位的主要工作内容、技术含量特征、以及未来的上升空间和职业发展路径。需保持公正客观，指出可能的天花板或局限性。

附加要求：
- 尽可能使用最新数据。
- 在最后，用一段话总结这个岗位（${position}）在该公司当前发展阶段可能面临的【核心机遇】与【最大挑战】。
- 格式严格按照 Markdown 输出，不要使用HTML标签，多使用粗体强调重点。`;

      const response = await ai.models.generateContentStream({
        model: 'gemini-3.1-pro-preview',
        contents: prompt,
        tools: [{ googleSearch: {} }]
      });

      let accumulatedText = '';
      for await (const chunk of response) {
        if (chunk.text) {
          accumulatedText += chunk.text;
          setReport(accumulatedText);
        }
      }
      
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to generate the report. Please check API key or try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (report && !loading && resultsRef.current) {
      resultsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [loading]);

  return (
    <div className="h-screen bg-slate-50 flex flex-col font-sans text-slate-900 overflow-hidden selection:bg-indigo-200">
      
      {/* Header Section */}
      <header className="bg-slate-900 text-white p-4 flex justify-between items-center shrink-0 border-b-2 border-indigo-500">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-indigo-500 rounded flex items-center justify-center font-bold text-lg">
            <Sparkles className="w-5 h-5"/>
          </div>
          <h1 className="text-xl font-semibold tracking-tight">CorpIntel <span className="text-slate-400 font-normal text-sm">v2.4 / Rapid Diligence</span></h1>
        </div>
        <div className="hidden sm:flex gap-2">
          <div className="px-3 py-1 bg-slate-800 rounded text-xs border border-slate-700 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse block"></span> Live Web Search
          </div>
          <div className="px-3 py-1 bg-slate-800 rounded text-xs border border-slate-700 flex items-center">
            System Online
          </div>
        </div>
      </header>

      {/* Search Interface */}
      <div className="p-4 bg-white border-b border-slate-200 flex flex-col sm:flex-row gap-4 shadow-sm shrink-0 items-end">
        <form onSubmit={generateReport} className="w-full flex flex-col sm:flex-row xl:flex-row gap-4 items-end">
          <div className="flex-1 w-full relative">
            <label htmlFor="company" className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
              Company Name <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Building2 className="h-4 w-4 text-slate-400" />
              </div>
              <input
                type="text"
                id="company"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="e.g. ByteDance (字节跳动)"
                className="w-full pl-9 pr-3 py-2 bg-slate-100 border border-slate-300 rounded-sm font-medium text-sm focus:outline-none focus:border-indigo-500 focus:bg-white transition-colors"
                required
                disabled={loading}
              />
            </div>
          </div>

          <div className="flex-1 w-full relative">
            <label htmlFor="businessLine" className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
              Business/Domain <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Layers className="h-4 w-4 text-slate-400" />
              </div>
              <input
                type="text"
                id="businessLine"
                value={businessLine}
                onChange={(e) => setBusinessLine(e.target.value)}
                placeholder="e.g. E-Commerce / Cloud / AI"
                className="w-full pl-9 pr-3 py-2 bg-slate-100 border border-slate-300 rounded-sm font-medium text-sm focus:outline-none focus:border-indigo-500 focus:bg-white transition-colors"
                required
                disabled={loading}
              />
            </div>
          </div>

          <div className="flex-1 w-full relative">
            <label htmlFor="position" className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
              Target Position <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Briefcase className="h-4 w-4 text-slate-400" />
              </div>
              <input
                type="text"
                id="position"
                value={position}
                onChange={(e) => setPosition(e.target.value)}
                placeholder="e.g. Senior Product Manager"
                className="w-full pl-9 pr-3 py-2 bg-slate-100 border border-slate-300 rounded-sm font-medium text-sm focus:outline-none focus:border-indigo-500 focus:bg-white transition-colors"
                required
                disabled={loading}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !company.trim() || !position.trim() || !businessLine.trim()}
            className="w-full sm:w-auto px-6 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-400 disabled:cursor-not-allowed text-white font-bold rounded-sm text-sm transition-colors uppercase tracking-wider h-[38px] flex items-center justify-center gap-2 shrink-0"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <span>Generate Intelligence</span>
            )}
          </button>
        </form>
      </div>

      {/* Main Content Dashboard */}
      <div className="flex-1 p-4 overflow-y-auto no-scrollbar">
        {(report || loading || error) ? (
          <div ref={resultsRef} className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm min-h-full flex flex-col">
            
            {error && (
              <div className="bg-red-50 text-red-700 p-3 rounded-sm border border-red-200 flex items-start gap-2 mb-4 shrink-0">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <p className="text-sm font-medium">{error}</p>
              </div>
            )}

            {loading && !report && (
              <div className="flex flex-col items-center justify-center flex-1 text-slate-500 space-y-4 min-h-[300px]">
                <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
                <div className="text-[10px] font-bold tracking-widest uppercase">Executing Live Scraping & Analysis...</div>
              </div>
            )}

            {report && (
              <div className="prose max-w-none prose-slate prose-sm 
                prose-headings:font-bold prose-headings:tracking-tight 
                prose-h1:text-indigo-600 prose-h1:text-xl prose-h1:uppercase prose-h1:border-b prose-h1:border-slate-200 prose-h1:pb-2 prose-h1:mb-4
                prose-h2:text-xs prose-h2:text-indigo-600 prose-h2:uppercase prose-h2:tracking-widest prose-h2:border-b prose-h2:border-slate-100 prose-h2:pb-2 prose-h2:mt-6 prose-h2:mb-3
                prose-h3:text-sm prose-h3:text-slate-800 prose-h3:mt-4 prose-h3:mb-2
                prose-p:text-xs prose-p:leading-relaxed prose-p:text-slate-700 prose-p:mb-3
                prose-li:text-xs prose-li:text-slate-700
                prose-strong:text-slate-900">
                
                <div className="markdown-body">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {report}
                  </ReactMarkdown>
                </div>

                {loading && (
                  <div className="mt-6 flex items-center gap-2 text-indigo-500 border-t border-slate-100 pt-4">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-[10px] uppercase tracking-widest font-bold">Inbound Transmission...</span>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="border border-slate-200 border-dashed rounded-lg bg-slate-50/50 h-full flex flex-col items-center justify-center text-slate-400 p-8 text-center min-h-[300px]">
            <div className="w-12 h-12 bg-white border border-slate-200 rounded shrink-0 flex items-center justify-center mb-4 shadow-sm">
              <BookOpen className="w-5 h-5 text-slate-300" />
            </div>
            <h3 className="text-slate-600 font-bold text-xs uppercase tracking-wider mb-2">Database Idle</h3>
            <p className="text-[11px] max-w-sm leading-relaxed">
              Input target company and position parameters above to initialize the deep dive data aggregation protocol.
            </p>
          </div>
        )}
      </div>
      
      {/* Bottom Action Bar */}
      <footer className="h-10 bg-indigo-50 border-t border-indigo-100 px-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-[9px] font-bold bg-indigo-200 text-indigo-700 px-1.5 py-0.5 rounded uppercase">Status Node</span>
          <p className="text-[10px] font-medium text-indigo-800">Awaiting search execution.</p>
        </div>
      </footer>
    </div>
  );
}
