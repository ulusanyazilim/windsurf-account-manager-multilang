# Dil Desteği Ekleme - Değişiklik Özeti

## Yapılan Değişiklikler

### 1. Dil Dosyaları Oluşturuldu
- **`src/locales/zh-CN.ts`** - Çince çeviriler
- **`src/locales/en-US.ts`** - İngilizce çeviriler  
- **`src/locales/tr-TR.ts`** - Türkçe çeviriler
- **`src/locales/index.ts`** - Dil yapılandırması ve export

### 2. Type Tanımları Güncellendi
- **`src/types/index.ts`**
  - `Settings` interface'ine `locale?: string` alanı eklendi

### 3. Store Güncellendi
- **`src/store/modules/settings.ts`**
  - `defaultSettings` içine `locale: 'zh-CN'` varsayılan değeri eklendi

### 4. App.vue Güncellendi
- **`src/App.vue`**
  - Element Plus için İngilizce ve Türkçe locale import edildi
  - `localeMap` objesi oluşturuldu (zh-CN, en-US, tr-TR)
  - `elementLocale` computed property eklendi (ayarlara göre dinamik locale seçimi)
  - Template'te `:locale="elementLocale"` kullanılıyor

### 5. WelcomeDialog Güncellendi
- **`src/components/WelcomeDialog.vue`**
  - Dil seçici dropdown eklendi (sağ üst köşede)
  - Tüm statik metinler dinamik çevirilerle değiştirildi
  - `useI18n` composable kullanılıyor
  - Dil değişikliği anında uygulanıyor

### 6. i18n Composable Oluşturuldu
- **`src/composables/useI18n.ts`**
  - Tüm bileşenlerde kullanılabilecek çeviri fonksiyonu
  - `locale`, `t` (translations), `setLocale` fonksiyonları export ediliyor

## Kullanım

### Herhangi bir bileşende çeviri kullanmak için:

```typescript
import { useI18n } from '@/composables/useI18n';

const { t, locale, setLocale } = useI18n();

// Template'te kullanım:
{{ t.welcome.title }}
{{ t.common.confirm }}
{{ t.settings.language }}
```

### Desteklenen Diller:
- 🇨🇳 简体中文 (zh-CN) - Varsayılan
- 🇬🇧 English (en-US)
- 🇹🇷 Türkçe (tr-TR)

## Özellikler

✅ Hoş geldin ekranında dil seçici  
✅ Seçilen dil ayarlarda saklanıyor  
✅ Element Plus bileşenleri de seçilen dile göre çevriliyor  
✅ Dil değişikliği anında uygulanıyor  
✅ Tüm bileşenlerde kullanılabilir composable yapı  

## Gelecek Geliştirmeler

Diğer bileşenlerde de çevirileri kullanmak için:
1. İlgili bileşene `useI18n` import edin
2. Statik metinleri `t.category.key` formatında değiştirin
3. Gerekirse `src/locales/*.ts` dosyalarına yeni çeviri anahtarları ekleyin
