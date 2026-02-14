# WiX Installer Dil Seçimi Konfigürasyonu

Bu dosya, Tauri uygulamasının çoklu dil desteğini nasıl sağladığını açıklar.

## Konfigürasyon

### `tauri.conf.json`
```json
"wix": {
  "language": [
    "en-US",
    "zh-CN",
    "tr-TR"
  ]
}
```

Tauri, bu dilleri otomatik olarak MSI installer'ına dahil eder.

## Nasıl Çalışır?

1. **Build Sırasında**: Tauri, belirtilen tüm dilleri tek bir MSI dosyasına paketler
2. **Kurulum Başlangıcında**: Windows, kurulum dilini sistem dilinden otomatik olarak seçer
3. **Dil Seçimi**: Kullanıcı, kurulum sırasında dili değiştirebilir
4. **Kurulum Devamı**: Seçilen dilde kurulum devam eder

## Kurulum Komutu

```bash
# Windows'ta MSI oluştur
npm run tauri build
```

Oluşturulan MSI dosyası: `src-tauri/target/release/bundle/msi/windsurf-account-manager_1.6.7_x64_en-US.msi`

## Dil Ekleme

Yeni bir dil eklemek için `tauri.conf.json` dosyasında dil kodunu ekleyin:

```json
"wix": {
  "language": [
    "en-US",
    "zh-CN",
    "tr-TR",
    "de-DE"  // Yeni dil
  ]
}
```

## Desteklenen Dil Kodları

- `en-US` - İngilizce
- `tr-TR` - Türkçe
- `zh-CN` - Çince Basitleştirilmiş
- `de-DE` - Almanca
- `fr-FR` - Fransızca
- `es-ES` - İspanyolca
- `ja-JP` - Japonca
- `ko-KR` - Korece

## Notlar

- Tek bir MSI dosyası tüm dilleri içerir
- Dosya boyutu biraz daha büyük olabilir (her dil için ~50-100KB ek)
- Kurulum sırasında dil otomatik olarak sistem dilinden seçilir
- Kullanıcı, kurulum sırasında dili değiştirebilir
- Seçilen dil, tüm kurulum süreci boyunca kullanılır

