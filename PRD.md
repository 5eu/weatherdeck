# WeatherDeck — PRD
**日期：** 2026-03-19  
**作者：** 苏工  
**项目类型：** D（功能为王）+ B（好玩的）  
**设计语言：** Braun Industrial / Dieter Rams 拟物风格

---

## 1. 用户画像（具体场景）

### 主用户：设计师 / 审美党
- **姓名：** 弄玉（原型用户）  
- **年龄：** 25–35 岁  
- **背景：** 设计师、工程师、创意从业者，对 Teenage Engineering/Braun/Apple 等工业设计品牌有感情  
- **场景 1：** 早上开电脑，想顺手查今天要不要带伞。打开 WeatherDeck，看到 Braun 收音机风格的面板亮起来，拨动旋钮切换城市，温度和湿度数据显示在模拟显示屏上——这体验本身就是一种享受  
- **场景 2：** 和朋友分享「你见过这样的天气 app 吗」，发链接，朋友打开第一眼就说"卧槽"  
- **场景 3：** 在展示自己的工具集时，放进去——这是有品位的开发者/设计师才会用的工具  

### 次要用户：任何想查天气的人
- 看到颜值，留下来；功能到位，会回来

---

## 2. 核心问题 → 方案推导

| 问题 | 现状 | WeatherDeck 方案 |
|------|------|------------------|
| 天气 app 千篇一律 | 蓝色卡片、云朵图标、扁平化UI | Braun 拟物设计，模拟收音机面板 |
| 查天气没有记忆点 | 用完即走 | 旋钮交互有触感，面板有物理感 |
| 没有个性的数据展示 | 数字列表 | 模拟指针/LCD 显示屏，有"调频感" |
| 多城市切换无聊 | 下拉菜单 | 旋转调谐旋钮，像换电台一样 |

---

## 3. 功能取舍表

| # | 功能 | 优先级 | 是否保留 | 理由 |
|---|------|--------|---------|------|
| 1 | 实时当前天气（温/湿/风/体感） | 必须 | ✅ 保留 | 核心数据 |
| 2 | Geolocation 自动定位 | 必须 | ✅ 保留 | 开箱即用体验 |
| 3 | 多城市预设 + 旋钮切换 | 必须 | ✅ 保留 | 核心交互差异化 |
| 4 | 天气状态指针动画（模拟表盘） | 高 | ✅ 保留 | 拟物核心视觉 |
| 5 | 动态背景随天气变化（晴/阴/雨/雪） | 高 | ✅ 保留 | 氛围感，参考 Apple 天气 |
| 6 | 7天预报 | 中 | ❌ Phase 2 | 先做好当前天气 |
| 7 | 小时预报折线图 | 中 | ❌ Phase 2 | 增加复杂度，暂缓 |
| 8 | 天气提醒/推送 | 低 | ❌ 不做 | 需要服务端，复杂度高 |
| 9 | 主题切换（昼/夜） | 低 | ❌ 暂缓 | 先做白天版 |
| 10 | 空气质量指数 | 低 | ❌ 不做 | 分散焦点，Open-Meteo 要额外 API |

### ✅ 保留的 5 个核心功能：
1. **自动定位 + 实时天气数据**（Open-Meteo API）
2. **多城市预设 + 旋钮切换城市**
3. **Braun 拟物面板 + 模拟仪表盘**（CSS-only 拟物质感）
4. **GSAP 旋钮旋转动画**（物理感交互）
5. **动态背景随天气变化**（晴/多云/雨/雪）

---

## 4. 技术方案

### 4.1 技术栈
```
前端：React 18 + Vite + Tailwind CSS v4
动画：GSAP（旋钮）+ CSS 动画（背景）
数据：Open-Meteo API（免费，无需 API key）
后端：Express.js（城市管理 + 缓存代理）
数据库：MongoDB + Mongoose（保存用户城市列表）
```

### 4.2 Mongoose Schema

```js
// City Schema
const CitySchema = new mongoose.Schema({
  name: { type: String, required: true },
  displayName: { type: String, required: true }, // 显示名（可能是中文）
  lat: { type: Number, required: true },
  lon: { type: Number, required: true },
  timezone: { type: String, default: 'auto' },
  order: { type: Number, default: 0 }, // 旋钮位置顺序
  createdAt: { type: Date, default: Date.now }
});

// WeatherCache Schema（可选，减少 API 调用）
const WeatherCacheSchema = new mongoose.Schema({
  cityId: { type: mongoose.Schema.Types.ObjectId, ref: 'City' },
  data: { type: Object },
  fetchedAt: { type: Date, default: Date.now, expires: 600 } // 10分钟过期
});
```

### 4.3 API 端点

```
GET  /api/cities          - 获取所有预设城市（旋钮列表）
POST /api/cities          - 添加城市
DELETE /api/cities/:id    - 删除城市

GET  /api/weather?lat=&lon= - 代理 Open-Meteo，返回格式化天气数据
GET  /api/weather/geo       - 根据 IP/坐标自动定位天气

// Open-Meteo 请求示例
// https://api.open-meteo.com/v1/forecast
// ?latitude=45.5&longitude=-73.6
// &current=temperature_2m,relative_humidity_2m,apparent_temperature,
//          wind_speed_10m,weather_code,cloud_cover
// &wind_speed_unit=kmh&temperature_unit=celsius
```

### 4.4 天气码映射（WMO Weather Codes → 状态）

```js
const weatherCodeMap = {
  0: { label: 'CLEAR', icon: '☀️', bg: 'sunny' },
  1: { label: 'MAINLY CLEAR', icon: '🌤️', bg: 'sunny' },
  2: { label: 'PARTLY CLOUDY', icon: '⛅', bg: 'cloudy' },
  3: { label: 'OVERCAST', icon: '☁️', bg: 'cloudy' },
  // 45-48: fog
  // 51-67: drizzle/rain
  // 71-77: snow
  // 80-82: rain showers
  // 95-99: thunderstorm
};
```

### 4.5 核心逻辑：旋钮交互

```
旋钮旋转角度 = (cityIndex / totalCities) * 270°
旋钮带阻尼感：GSAP ease: "elastic.out(1, 0.3)"
旋转时：
  1. GSAP 动画旋钮到新角度
  2. 淡出当前天气数据
  3. fetch 新城市天气
  4. 数字滚动动画更新数据（CountUp.js）
  5. 背景渐变切换
```

---

## 5. 风险清单

| 风险 | 可能性 | 影响 | 缓解方案 |
|------|--------|------|---------|
| Open-Meteo API 超限 | 低 | 高 | 加服务端缓存（10分钟），显示缓存时间戳 |
| Geolocation 被拒绝 | 中 | 中 | fallback 到预设城市列表（第一个） |
| CSS 拟物效果在暗背景下消失 | 中 | 高 | 保持奶油白背景，不做深色主题 |
| GSAP 旋钮与鼠标拖拽冲突 | 低 | 中 | 用 click 而非 drag，更简单可靠 |
| 移动端旋钮交互难用 | 高 | 中 | 旋钮在移动端改为左右滑动手势 |
| MongoDB 本地未安装 | 中 | 低 | 降级用 JSON 文件存城市列表 |

---

## 6. 竞品分析

### 竞品 1：Apple 天气 App
- ✅ 动态背景随天气变化（我们要学的）
- ✅ 数据展示清晰，简洁
- ❌ 仅限 iOS，无网页版
- **WeatherDeck 差异化：** 网页端 + 拟物设计，更有个性

### 竞品 2：Weather.com / AccuWeather
- ✅ 数据全面（7天、小时预报）
- ❌ 广告多，UI 没有设计感
- ❌ 没有任何拟物/工业设计元素
- **WeatherDeck 差异化：** 简洁精准 + Braun 工业美学

### 竞品 3：Wunderground（地下天气）
- ✅ 数据很专业（气象站数据）
- ❌ UI 过时，没有设计感
- **WeatherDeck 差异化：** 专注颜值 + 核心数据

### 竞品 4：windy.com
- ✅ 数据可视化很强（风场动画）
- ❌ 功能太复杂，学习成本高
- **WeatherDeck 差异化：** 极简查天气，一眼看完

### 差异化总结
WeatherDeck 是**唯一**一个有 Braun 工业设计语言的网页天气应用。没有竞品。这就是差异化。

---

## 7. 视觉方向（给 Phase 2 Design 的指导）

### 参考物理产品
- **Braun T3 收音机（1958）** — 圆形调谐旋钮、刻度指针、奶油色外壳
- **Braun ET66 计算器（1987）** — 功能性按钮排列、橙色点缀、简洁排版
- **Apple 天气 app** — 动态背景、数据层次感

### 配色方案
```
主色（外壳）：#F5F0E8（奶油白，带米黄）
旋钮：#D4C8B0（磨砂塑料，稍深）
指针/强调色：#E84E0F（Braun 橙红，标志性颜色）
LCD 屏幕：#1A2012（深橄榄绿，仿老式液晶）
LCD 字体色：#7EFF6B（磷光绿，液晶感）
刻度线：#8B7355（深米色）
阴影：用 box-shadow 双层模拟塑料深度
```

### 字体
- **主数字显示：** `DSEG7 Classic` 或 `LCD Condensed`（LCD 数字风格）
- **标签文字：** `DIN Condensed` 或 `Bebas Neue`（德国工业字体）
- **备选：** Google Fonts 上的 `Share Tech Mono`（电子感等宽）

### 布局原则
- 面板是主角：宽屏居中，像一台真实的仪器
- 旋钮在左侧，LCD 显示屏在中间，数据指标在右侧
- "Less, but better" — 只显示 5 个核心数据指标
