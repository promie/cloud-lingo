"use client";

import { FC, useState } from "react";
import { useTranslateText } from "@/hooks/useTranslateText";

const TranslationForm: FC = () => {
  const [inputText, setInputText] = useState("");
  const [inputLang, setInputLang] = useState("");
  const [outputLang, setOutputLang] = useState("");
  const [translatedText, setTranslatedText] = useState("");

  const { mutate: translateText, isError } = useTranslateText();

  const handleTranslate = () => {
    translateText(
      { sourceLang: inputLang, targetLang: outputLang, sourceText: inputText },
      {
        onSuccess: (data) => {
          setTranslatedText(data as any);
        },
        onError: (error) => {
          console.error("Translation error:", error);
        },
      },
    );
  };

  return (
    <div className="space-y-4">
      <label className="form-control w-full max-w-xs">
        <div className="label">
          <span className="label-text">Input Text</span>
        </div>
        <input
          type="text"
          className="input input-bordered w-full max-w-xs"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
        />
      </label>
      <label className="form-control w-full max-w-xs">
        <div className="label">
          <span className="label-text">Input Language</span>
        </div>
        <input
          type="text"
          className="input input-bordered w-full max-w-xs"
          value={inputLang}
          onChange={(e) => setInputLang(e.target.value)}
        />
      </label>
      <label className="form-control w-full max-w-xs">
        <div className="label">
          <span className="label-text">Output Language</span>
        </div>
        <input
          type="text"
          className="input input-bordered w-full max-w-xs"
          value={outputLang}
          onChange={(e) => setOutputLang(e.target.value)}
        />
      </label>
      <button
        className="btn btn-active btn-primary"
        onClick={handleTranslate}
      >
        Translate
      </button>

      {isError && (
        <div className="text-red-500">
          An error occurred during translation.
        </div>
      )}

      {translatedText && (
        <div className="mt-4">
          <h3 className="font-bold">Translated Text:</h3>
          <p>{JSON.stringify(translatedText)}</p>
        </div>
      )}
    </div>
  );
};

export default TranslationForm;
