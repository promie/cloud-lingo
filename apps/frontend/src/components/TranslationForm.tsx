'use client'

import { FC, useState } from 'react'
import { useTranslateText } from '@/hooks/useTranslateText'
import { useGetTranslations } from '@/hooks/useGetTranslations'
import { ITranslateResponse } from '@cl/shared-types'

const TranslationForm: FC = () => {
  const [inputText, setInputText] = useState('')
  const [inputLang, setInputLang] = useState('')
  const [outputLang, setOutputLang] = useState('')
  const [translatedText, setTranslatedText] = useState('')
  const [translations, setTranslations] = useState<any>([])

  const { mutate: translateText, isError } = useTranslateText()
  const { data: fetchedTranslations, refetch } = useGetTranslations()

  const handleTranslate = () => {
    translateText(
      { sourceLang: inputLang, targetLang: outputLang, sourceText: inputText },
      {
        onSuccess: data => {
          setTranslatedText(data as any)
        },
        onError: error => {
          console.error('Translation error:', error)
        },
      },
    )
  }

  const handleGetTranslations = async () => {
    await refetch()
    setTranslations(fetchedTranslations || [])
  }

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
          onChange={e => setInputText(e.target.value)}
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
          onChange={e => setInputLang(e.target.value)}
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
          onChange={e => setOutputLang(e.target.value)}
        />
      </label>
      <button className="btn btn-active btn-primary" onClick={handleTranslate}>
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

      <button
        className="btn btn-active btn-secondary ml-[10px]"
        onClick={handleGetTranslations}
      >
        Get Translations
      </button>

      {translations.length > 0 && (
        <div className="mt-4">
          <h3 className="font-bold">Translations:</h3>
          <ul>
            {translations.map(
              (translation: ITranslateResponse, index: number) => (
                <li key={index}>{JSON.stringify(translation)}</li>
              ),
            )}
          </ul>
        </div>
      )}
    </div>
  )
}

export default TranslationForm
