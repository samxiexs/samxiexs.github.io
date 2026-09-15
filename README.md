# Shen (Sam) Xie — personal website

An English academic homepage with separate spaces for photography and music. Plain HTML, CSS, and a small amount of JavaScript; no dependencies or build step. Decorative graphics are generated in the browser with Canvas and SVG. Intended URL: https://samxiexs.github.io/.

## 本地预览

在本项目根目录运行 `python3 -m http.server 8000 --bind 127.0.0.1`，打开 http://127.0.0.1:8000 。主页直接打开 `index.html` 也可浏览。

## 结构与设计

布局参考 Kexin Huang 的主页：左侧固定 sidebar（名字、身份、导航、社交链接、亚特兰大当地时间、Appearance 设置），右侧为一整页内容；滚动时导航自动高亮当前章节（短横线变长的激活样式借自 Haotian Ye 的主页）。手机端 sidebar 折叠为顶部横向导航。

视觉上刻意保持"自己搭的学术主页"的样子：白底、近黑正文、Inter 字体、等宽小字做日期/状态等元数据，只有一种强调色。深色模式为深灰蓝底（`#161b26`），默认跟随访问者系统设置。强调色可在 Appearance 里选（蓝 / 绿 / 金 / 玫红 / 墨），颜色定义在 `style.css` 开头的 `data-accent` 规则和 `appearance.js` 的 `accents` 表中，两处需保持一致。

所有图形都用原生 Canvas / SVG 绘制，用正文色画成"论文插图"的样子，没有任何第三方库或构建步骤：

- **首页流场**（`field.js`）：单纯形噪声向量场上的粒子流线，鼠标经过会形成小漩涡，点击会让线条"扩散"成噪声再重新聚合（呼应 diffusion 研究）。开启系统"减少动态效果"时只渲染一帧静态流线。同一组件也用于摄影、音乐和 404 页面的标题区。
- **项目封面**（`site.js`）：按项目主题程序化生成——创作者匹配网络图、RQ-VAE 四个 codebook 的单元格网格（强调色标出被选中的码）、引用树；hover 时分别有数据流动、单元闪烁、树生长动画。每张图下有等宽字体的 fig. 说明。
- 头像 hover 时轻微 3D 倾斜；主题切换使用 View Transitions 圆形扩散过渡。

## 更新内容

- `index.html`：个人介绍、研究项目、经历、教育、动态。研究内容直接存在 HTML 中，禁用 JavaScript 也能阅读。每条研究可用 `<details class="paper-details">` 附加展开的细节。
- `style.css`：全站颜色、字体、桌面及手机布局。颜色变量在文件开头，`--field-rgb` 供 Canvas 读取流场线条颜色。
- `site.js`：滚动高亮、头像倾斜、当地时间、项目封面生成。给项目卡片加 `data-cover="network|codebook|tree"` 即可获得对应封面。
- `field.js`：流场动画；`scale`、`speed`、`fillStyle` 的透明度控制线条的疏密和拖尾长度。
- `appearance.js`：Appearance 设置。可选择 System / Light / Dark、五种强调色、Default / Mono 字体，以及 90% 至 110% 的字体大小；选择会保存于访问者的浏览器，并在全部页面沿用。
- `pic/self.jpg`：个人照片；当前使用原图，由 CSS 控制展示区域。
- `cv-refernce/ShenXie-CV-20260914.pdf`：网站链接的当前 CV。替换版本后同步修改各页面中的链接。
- `collections.js`：照片和音乐条目；两个数组留空时显示待更新说明。
- `photography.html` / `music.html`：独立的个人兴趣页面。照片点击后在页内灯箱中查看，支持左右方向键。
- 正文字体 Inter 通过 Google Fonts 加载，加载失败时回退到系统无衬线字体。

### 添加照片

把照片放在 `pic/photos/`，在 `collections.js` 的 `photos` 数组中加入：

```js
{ src: "pic/photos/atlanta.jpg", alt: "描述画面内容", caption: "Atlanta · 2026" }
```

页面自动出现双列照片集，手机为单列；点击照片查看原图。只使用自己的实际照片。

### 添加音乐

在 `music` 数组中加入分享链接：

```js
{ title: "歌单名称", artist: "作者", note: "分享理由", url: "https://你的音乐链接" }
```

或把可分享的音频放在 `assets/audio/`，使用 `src: "assets/audio/recording.mp3"` 代替 `url`。页面自动生成原生播放器，不会自动播放。

## GitHub Pages

将网站文件提交并推送到当前仓库，在 GitHub 的 **Settings → Pages → Build and deployment** 中选择 **Deploy from a branch**，选择实际推送的分支（通常为 `main`）和 **/ (root)**，保存即可。`.nojekyll` 保证文件按静态资源发布。无需 npm、Jekyll、域名或服务器费用。

若 Pages 已使用 GitHub Actions，请切换为以上分支发布方式，或自行配置工作流；本项目没有构建工作流。新建自定义域名还需要 DNS 和 Pages 设置，不能仅添加 CNAME 文件。

## 内容依据和维护说明

依据两份 September 2026 CV，页面链接以 `20260914` 版为准。项目链接来自 PDF 中的真实超链接。广告推荐项目两份 CV 对合作者描述不同，因此网页省略这处归属描述。HCI 项目按 CV 说明隐藏题目和研究细节。所有在研论文都明确标注为在研/审稿中，未写成已录用，也未将拟投会议写成发表记录。具体状态请随研究进度更新。

摄影和音乐尚未提供素材，因此没有使用第三方照片或虚构作品。设计参考 Kexin Huang 网站中研究与个人兴趣并存的结构，以及用户提供的学术主页；代码独立编写。
