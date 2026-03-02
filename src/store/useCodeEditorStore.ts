import { LANGUAGE_CONFIG } from "@/app/(root)/_constants";
import { CodeEditorState } from "@/types";
import { Monaco } from "@monaco-editor/react";
import { create } from "zustand";

const getInitialState = () => {
  // if we're on the server, return default values
  if (typeof window === "undefined") {
    return {
      language: "javascript",
      fontSize: 16,
      theme: "vs-dark",
    };
  }

  const savedLanguage = localStorage.getItem("editor-language") || "javascript";
  const savedTheme = localStorage.getItem("editor-theme") || "vs-dark";
  const savedFontSize = Number(localStorage.getItem("editor-font-size")) || 16;

  return {
    language: savedLanguage,
    fontSize: savedFontSize,
    theme: savedTheme,
  };
};

export const useCodeEditorStore = create<CodeEditorState>((set, get) => {
  const initialState = getInitialState();

  return {
    ...initialState,
    output: "",
    isRunning: false,
    error: null,
    editor: null,
    executionResult: null,
    userInput: "",

    getCode: () => get().editor?.getValue() || "",

    setUserInput: (userInput: string) => set({ userInput }),

    setEditor: (editor: Monaco) => {
      const savedCode = localStorage.getItem(`editor-code-${get().language}`);
      if (savedCode) editor.setValue(savedCode);

      set({ editor });
    },

    setTheme: (theme: string) => {
      localStorage.setItem("editor-theme", theme);
      set({ theme });
    },

    setFontSize: (fontSize: number) => {
      localStorage.setItem("editor-font-size", fontSize.toString());
      set({ fontSize });
    },

    setLanguage: (language: string) => {
      const currentCode = get().editor?.getValue();
      if (currentCode) {
        localStorage.setItem(`editor-code-${get().language}`, currentCode);
      }

      localStorage.setItem("editor-language", language);

      set({
        language,
        output: "",
        error: null,
      });
    },

    runCode: async () => {
        const { language, getCode, userInput } = get();
        const code = getCode();
  
        if (!code) {
          set({ error: "Please enter some code" });
          return;
        }
  
        set({ isRunning: true, error: null, output: "" });
  
        try {
          const { judge0Id } = LANGUAGE_CONFIG[language];
          const response = await fetch("https://ce.judge0.com/submissions?base64_encoded=false&wait=true", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              language_id: judge0Id,
              source_code: code,
              stdin: userInput,
            }),
          });
  
          const data = await response.json();
  
          console.log("data back from judge0:", data);
  
          // Judge0 status handling
          // status id 3: Accepted
          // status id 4: Wrong Answer (usually for competitive coding, here it just means it ran)
          // Other statuses signify errors
  
          if (data.status && data.status.id > 4) {
             const error = data.stderr || data.compile_output || data.message || "Execution error";
             set({
               error,
               executionResult: {
                 code,
                 output: "",
                 error,
               },
             });
             return;
          }
  
          // if we get here, execution was successful
          const output = data.stdout || "";
  
          set({
            output: output.trim(),
            error: null,
            executionResult: {
              code,
              output: output.trim(),
              error: null,
            },
          });
        } catch (error) {
          console.log("Error running code:", error);
          set({
            error: "Error running code",
            executionResult: { code, output: "", error: "Error running code" },
          });
        } finally {
          set({ isRunning: false });
        }
    },
  };
});


export const getExecutionresult = () => useCodeEditorStore.getState().executionResult;