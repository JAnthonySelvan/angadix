# Angadix Multi-Language & i18n Architecture Documentation

This document explains how multi-language support (Phase 8) is structured and how to add, modify, or extend translations in the Angadix e-commerce application.

---

## 1. Supported Languages

Angadix supports 7 languages out-of-the-box:

| Language Code | Language Name | Native Display | Direction |
|---------------|---------------|----------------|-----------|
| `en`          | English       | English        | LTR       |
| `ta`          | Tamil         | தமிழ்           | LTR       |
| `hi`          | Hindi         | हिन्दी          | LTR       |
| `fr`          | French        | Français       | LTR       |
| `de`          | German        | Deutsch        | LTR       |
| `es`          | Spanish       | Español        | LTR       |
| `ar`          | Arabic        | العربية         | RTL       |

---

## 2. Directory Structure

All i18n configuration and locale translation dictionaries are located in `src/i18n/`:

```
src/i18n/
├── index.js             # Main i18next configuration & initialization
├── locales/             # Separate JSON files for each language
│   ├── en.json
│   ├── ta.json
│   ├── hi.json
│   ├── fr.json
│   ├── de.json
│   ├── es.json
│   └── ar.json
└── README_I18N.md       # Developer guide & instructions
```

---

## 3. Core Principles & Features

1. **Initialization**: Configured in `src/i18n/index.js` and imported in `src/main.jsx` before the App renders.
2. **Language Persistence**: User preference is stored in `localStorage` under the key `angadix_language`.
3. **Browser Detection**: If no `localStorage` preference exists, browser language is detected automatically, falling back to English (`en`).
4. **Dynamic Document Attributes**:
   - Updates `<html lang="[code]">` dynamically.
   - Updates `<html dir="rtl">` dynamically when Arabic (`ar`) is selected, and `<html dir="ltr">` for all other languages.
5. **English Fallback**: Missing keys fall back to English text smoothly without UI errors.

---

## 4. How to Use Translations in Components

Import `useTranslation` hook from `react-i18next`:

```jsx
import { useTranslation } from 'react-i18next';

export const MyComponent = () => {
  const { t } = useTranslation();

  return (
    <div>
      <h1>{t('home.heroTag', 'Premium Technology')}</h1>
      <button>{t('common.addToCart', 'Add to Cart')}</button>
    </div>
  );
};
```

---

## 5. Adding New Translation Keys

1. Open `src/i18n/locales/en.json` (the base reference).
2. Add your key inside the relevant section, e.g.:

```json
"checkout": {
  "myNewField": "My New Field Label"
}
```

3. Add matching translations for all other language files (`ta.json`, `hi.json`, `fr.json`, `de.json`, `es.json`, `ar.json`).

---

## 6. Adding a New Language

1. Create a new JSON file in `src/i18n/locales/[code].json`.
2. Import the JSON in `src/i18n/index.js` and register it in `resources` and `supportedLngs`.
3. Add the language entry to `LANGUAGES` array in `src/components/common/LanguageSwitcher.jsx`.
