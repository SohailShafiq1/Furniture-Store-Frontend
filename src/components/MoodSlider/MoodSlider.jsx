import './MoodSlider.css';
import { useEffect, useState } from 'react';

export default function MoodSlider() {
  // Use actual files in the public/mood folder
  const items = [
    { id: 1, img: '/mood/Gemini_Generated_Image_87xwn387xwn387xw.png', text: 'Furniture For' },
    { id: 2, img: '/mood/Gemini_Generated_Image_dmdgnsdmdgnsdmdg.png', text: 'Every room' },
    { id: 3, img: '/mood/Gemini_Generated_Image_t89yagt89yagt89y.png', text: 'Every mood' },
  ];

  // Duplicate for a seamless loop like SlidingBanner
  const all = [...items, ...items, ...items];

  return (
    <section className="mood-slider">
      <div className="mood-track">
        <div className="mood-content">
          {all.map((it, idx) => (
            <div className="mood-item" key={`${it.id}-${idx}`}>
              <div className="mood-image-wrap">
                <img src={it.img} alt={it.text} className="mood-image" />
              </div>
              <div className="mood-text">{it.text}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
