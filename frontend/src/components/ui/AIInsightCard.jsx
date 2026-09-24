import React from "react";
import { Sparkles, Brain, ArrowUpRight, TrendingUp } from "lucide-react";

export const AIInsightCard = ({ insight, source = "AI_MODEL" }) => {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900/90 to-slate-800/80 p-5 border border-slate-700/60 shadow-xl group hover:border-emerald-500/40 transition-all duration-300">
      {/* Ambient glow accent */}
      <div className="absolute -top-12 -right-12 w-28 h-28 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-colors" />

      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30 shadow-inner">
            {source === "AI_MODEL" ? (
              <Sparkles size={16} />
            ) : (
              <Brain size={16} />
            )}
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700">
              {insight.category || "MARKET INTELLIGENCE"}
            </span>
          </div>
        </div>

        {insight.confidence && (
          <span className="text-[10px] font-semibold text-emerald-400/90 bg-emerald-950/40 border border-emerald-800/50 px-2 py-0.5 rounded-full">
            {insight.confidence} CONFIDENCE
          </span>
        )}
      </div>

      <h4 className="text-base font-bold text-white mb-2 leading-snug group-hover:text-emerald-300 transition-colors">
        {insight.title}
      </h4>

      <p className="text-xs text-slate-300 leading-relaxed mb-4">
        {insight.summary}
      </p>

      {insight.supportingData && (
        <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
          <span className="flex items-center gap-1">
            <TrendingUp size={13} className="text-emerald-400" />
            <strong className="text-slate-200">Evidence:</strong>{" "}
            {insight.supportingData}
          </span>
          <ArrowUpRight
            size={14}
            className="text-slate-500 group-hover:text-emerald-400 transition-colors"
          />
        </div>
      )}
    </div>
  );
};
