"use client"

import { useCodeEditorStore } from "@/store/useCodeEditorStore";
import { AlertTriangle, CheckCircle, Clock, Copy, Terminal } from "lucide-react";
import { useState } from "react";
import RunningCodeSkeleton from "./RunningCodeSkeleton";

function OutputPanel() {

  const {output,error,isRunning, userInput, setUserInput} = useCodeEditorStore();
  const [isCopied, setisCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<"output" | "input">("output");

  const hasContent = error || output;


  const handleCopy = async() => {
    if(!hasContent) return
    await navigator.clipboard.writeText(error || output)
    setisCopied(true)

    setTimeout(() => {
      setisCopied(false)
    },2000)
  }
 
  return (
    <div className="relative bg-[#181825] rounded-xl p-4 ring-1 ring-gray-800/50">
      {/* Header and Tabs */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-6 h-6 rounded-lg bg-[#1e1e2e] ring-1 ring-gray-800/50">
              <Terminal className="w-4 h-4 text-purple-400" />
            </div>
            <span className="text-sm font-medium text-blue-300">Terminal</span>
          </div>
          
          <div className="flex items-center gap-1 p-1 bg-[#1e1e2e] rounded-lg ring-1 ring-gray-800/50">
            <button
               onClick={() => setActiveTab("output")}
               className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                 activeTab === "output" 
                 ? "bg-purple-500/10 text-purple-400" 
                 : "text-gray-400 hover:text-gray-300"
               }`}
            >
              Output
            </button>
            <button
               onClick={() => setActiveTab("input")}
               className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                 activeTab === "input" 
                 ? "bg-purple-500/10 text-purple-400" 
                 : "text-gray-400 hover:text-gray-300"
               }`}
            >
              Input
            </button>
          </div>
        </div>

        {activeTab === "output" && hasContent && (
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-gray-400 hover:text-gray-300 bg-[#1e1e2e] 
            rounded-lg ring-1 ring-gray-800/50 hover:ring-gray-700/50 transition-all"
          >
            {isCopied ? (
              <>
                <CheckCircle className="w-3.5 h-3.5" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                Copy
              </>
            )}
          </button>
        )}
      </div>

      {/* Content Area */}
      <div className="relative">
        <div className="relative bg-[#1e1e2e]/50 backdrop-blur-sm border border-[#313244] rounded-xl p-4 h-[600px] overflow-auto font-mono text-sm">
            {activeTab === "output" ? (
              isRunning ? (
                <RunningCodeSkeleton/>
              ) : error ? (
                <div className="flex items-start gap-3 text-red-400">
                  <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-1"/>
                  <div className="space-y-1">
                    <div className="font-medium">Execution Error</div>
                    <pre className="whitespace-pre-wrap text-red-400/80">{error}</pre>
                  </div>
                </div>
              ) : output ? (
                <div className="space-y-2">
                <div className="flex items-center gap-2 text-purple-400 mb-3">
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-medium">Execution Successful</span>
                </div>
                <pre className="whitespace-pre-wrap text-blue-300">{output}</pre>
              </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-gray-500">
                <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gray-800/50 ring-1 ring-gray-700/50 mb-4">
                  <Clock className="w-6 h-6 text-purple-400" />
                </div>
                <p className="text-center text-purple-300">Run your code to see the output here...</p>
              </div>
              )
            ) : (
              <textarea
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder="Enter standard input (stdin) here..."
                className="w-full h-full bg-transparent border-none focus:outline-none text-blue-300 resize-none placeholder:text-gray-600"
              />
            )}
        </div>

      </div>
    </div>
  )
}

export default OutputPanel
