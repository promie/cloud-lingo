'use client'

import { FC } from 'react'

const TranslationForm: FC = () => {
  return (
    <div>
      <label className="form-control w-full max-w-xs">
        <div className="label">
          <span className="label-text">Input Text</span>
        </div>
        <input type="text" className="input input-bordered w-full max-w-xs" />
      </label>
      <label className="form-control w-full max-w-xs">
        <div className="label">
          <span className="label-text">Input Language</span>
        </div>
        <input type="text" className="input input-bordered w-full max-w-xs" />
      </label>
      <label className="form-control w-full max-w-xs">
        <div className="label">
          <span className="label-text">Output Language</span>
        </div>
        <input type="text" className="input input-bordered w-full max-w-xs" />
      </label>
      <button className="btn btn-active btn-primary">Translate</button>
    </div>
  )
}

export default TranslationForm