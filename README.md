# 🔤 Unicode Escape Dönüştürücü

Türkçe karakterleri ve diğer ASCII dışı işaretleri kaçış dizisine (escape sequence) çeviren, tek dosyalık bir tarayıcı aracı. Yazdıkça ve yapıştırdıkça anında dönüşür, ters yönde kod çözme de yapar. Sunucu yok, bağımlılık yok, metin cihazdan çıkmaz.


## 🚀 Temel Kullanım

Sağ üstteki 📋 düğmesi ya da <kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>C</kbd> sonucu panoya kopyalar.


## 📚 Karakter Referansı

Aşağıdaki 12 karakter, varsayılan kapsamda dönüştürülenlerdir. Uygulamadaki karta tıklamak o kodu panoya kopyalar.

| Karakter | JS / JSON | CSS        | HTML (hex) | HTML (dec) | URL      |
| :------- | :-------- | :--------- | :--------- | :--------- | :------- |
| `ü`      | `\u00FC`  | `\0000FC`  | `&#xFC;`   | `&#252;`   | `%C3%BC` |
| `Ü`      | `\u00DC`  | `\0000DC`  | `&#xDC;`   | `&#220;`   | `%C3%9C` |
| `ş`      | `\u015F`  | `\00015F`  | `&#x15F;`  | `&#351;`   | `%C5%9F` |
| `Ş`      | `\u015E`  | `\00015E`  | `&#x15E;`  | `&#350;`   | `%C5%9E` |
| `ğ`      | `\u011F`  | `\00011F`  | `&#x11F;`  | `&#287;`   | `%C4%9F` |
| `Ğ`      | `\u011E`  | `\00011E`  | `&#x11E;`  | `&#286;`   | `%C4%9E` |
| `ı`      | `\u0131`  | `\000131`  | `&#x131;`  | `&#305;`   | `%C4%B1` |
| `İ`      | `\u0130`  | `\000130`  | `&#x130;`  | `&#304;`   | `%C4%B0` |
| `ö`      | `\u00F6`  | `\0000F6`  | `&#xF6;`   | `&#246;`   | `%C3%B6` |
| `Ö`      | `\u00D6`  | `\0000D6`  | `&#xD6;`   | `&#214;`   | `%C3%96` |
| `ç`      | `\u00E7`  | `\0000E7`  | `&#xE7;`   | `&#231;`   | `%C3%A7` |
| `Ç`      | `\u00C7`  | `\0000C7`  | `&#xC7;`   | `&#199;`   | `%C3%87` |

## 🎛️ Ayar Referansı

### Yön

| Değer | Açıklama |
| :---- | :------- |
| `Metin → kaçış kodu` | Okunabilir metni seçilen biçimdeki koda çevirir. |
| `Kaçış kodu → metin` | Kodu tekrar okunabilir metne çevirir. Bu modda biçim ve kapsam seçenekleri devre dışı kalır, tanınan tüm biçimler otomatik çözülür. |

### Biçim

| Değer | Çıktı | Nerede kullanılır |
| :---- | :---- | :---------------- |
| `js` | `\u00FC` | JavaScript, JSON, Java, C#, Python kaynak dosyaları |
| `css` | `\0000FC` | CSS `content` değerleri ve seçici kaçışları |
| `htmlx` | `&#xFC;` | HTML gövdesi, onaltılık varlık gösterimi |
| `htmld` | `&#252;` | HTML gövdesi, ondalık varlık gösterimi |
| `pct` | `%C3%BC` | URL yolu ve sorgu dizesi |

### Kapsam

| Değer | Açıklama |
| :---- | :------- |
| `Yalnızca Türkçe harfler` | Sadece yukarıdaki 12 karakteri dönüştürür, geri kalan her şeye dokunmaz. |
| `Tüm ASCII dışı karakterler` | Kod noktası 127'nin üstündeki her karakteri dönüştürür (Türkçe, Arapça, emoji, tipografik tırnaklar). |
| `ASCII dışı + tırnak, \ ve satır sonu` | Yukarıdakine ek olarak `\`, `"`, `'`, satır sonu ve sekme karakterlerini de kaçışlar. Dize gömme için en güvenli seçenek. |

### Diğer

| Ayar | Açıklama |
| :--- | :------- |
| `küçük harf onaltılık` | `\u00fc` biçiminde küçük harfli çıktı üretir. |
| `Sonucu girişe taşı` | Çıktıyı girişe kopyalar ve yönü ters çevirir. Gidiş-dönüş doğrulaması için kullanışlıdır. |
| `Örnek metin yükle` | Hazır bir test satırı yükler. |
| `İndir` | Sonucu `.txt` dosyası olarak kaydeder. |

## ✨ Örnekler

### Türkçe harfleri kaçışlama
Kapsam: yalnızca Türkçe harfler — Biçim: JS

```
Giriş:  Şeftali ağacı ışıldıyor
Çıkış:  \u015Eeftali a\u011Fac\u0131 \u0131\u015F\u0131ld\u0131yor
```

### Dizeye gömülebilir güvenli çıktı
Kapsam: ASCII dışı + tırnak, `\` ve satır sonu — Biçim: JS

```
Giriş:  Ürün "Kırmızı"	\ yeni
Çıkış:  \u00DCr\u00FCn \"K\u0131rm\u0131z\u0131\"\t\\ yeni
```

### CSS içeriği
Kapsam: yalnızca Türkçe harfler — Biçim: CSS

```
Giriş:  Çıkış
Çıkış:  \0000C7\000131k\000131\00015F
```

### URL parçası
Kapsam: tüm ASCII dışı karakterler — Biçim: URL

```
Giriş:  şeker-fiyatı
Çıkış:  %C5%9Feker-fiyat%C4%B1
```

### Emoji ve vekil çiftler
Kapsam: tüm ASCII dışı karakterler

```
Giriş:  Merhaba 😀
JS:     Merhaba \uD83D\uDE00
HTML:   Merhaba &#x1F600;
```

JS biçiminde karakter iki kod birimine bölünür, çünkü JavaScript dizeleri UTF-16 kod birimlerinden oluşur. CSS ve HTML tam kod noktasını tek kaçışla yazar.

### Kod çözme
Yön: kaçış kodu → metin

```
Giriş:  \u015Eeftali &#287;ida %C3%BCr%C3%BCn \x41
Çıkış:  Şeftali ğida ürün A
```

## 🔍 Çözülebilen Biçimler

Kod çözme modu aşağıdaki gösterimleri tanır ve karışık haldeki metinde hepsini aynı anda çözer:

| Gösterim | Örnek |
| :------- | :---- |
| JS / Java / JSON | `\u00FC` |
| ES6 kod noktası | `\u{1F600}` |
| Onaltılık bayt | `\xC3` |
| CSS | `\0000FC` veya `\FC ` |
| HTML onaltılık | `&#xFC;` |
| HTML ondalık | `&#252;` |
| URL yüzde | `%C3%BC` |
| Kısa kaçışlar | `\n` `\r` `\t` `\\` `\"` `\'` |

## 📊 Sayaçlar

Her iki panelin altında canlı sayaçlar bulunur.

| Sayaç | Açıklama |
| :---- | :------- |
| `karakter` | Metnin uzunluğu (UTF-16 kod birimi sayısı). |
| `satır` | Satır sayısı. |
| `bayt (UTF-8)` | Metnin UTF-8 karşılığının bayt uzunluğu. |
| `dönüştürülen` | Kaçışlanan veya çözülen karakter sayısı. Üst köşedeki sayaç da bunu gösterir. |
| `uzama` | Çıktının girişe göre yüzde büyümesi. |

## ⌨️ Kısayollar

| Kısayol | İşlev |
| :------ | :---- |
| <kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>C</kbd> | Sonucu kopyala |
| <kbd>Tab</kbd> | Giriş alanına sekme karakteri ekler (odak sıçramaz) |
| <kbd>Enter</kbd> / <kbd>Boşluk</kbd> | Odaklanmış harita kartındaki kodu kopyalar |


## 🧩 Teknik Notlar

- Tek dosya, çerçeve yok, derleme adımı yok. Tüm CSS ve JS gömülüdür.
- Kaçışlama UTF-16 kod birimi üzerinden yürür; JS biçiminde vekil çiftler ayrı ayrı yazılır, diğer biçimlerde birleştirilip tek kod noktası olarak üretilir.
- Kopyalama `navigator.clipboard` kullanır; güvenli bağlam yoksa `execCommand` yedeğine düşer.
- `file://` protokolünde pano okuma (yapıştır düğmesi) tarayıcı tarafından engellenebilir; bu durumda <kbd>Ctrl</kbd> + <kbd>V</kbd> çalışır.
- Metin hiçbir uç noktaya gönderilmez, tüm işlem tarayıcıda yapılır.

## 🤝 Katkıda Bulunma

Sorun bildirimi ve öneriler için GitHub Repo sayfasını ziyaret edebilirsiniz.

## 📄 Lisans

[MIT License](https://opensource.org/licenses/MIT)
