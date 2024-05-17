# 连接到 Lolipop 的 Minecraft 服务器

## 服务器地址

`mc.towind.fun`

## 服务器地图

访问 `https://mc.towind.fun/map` 查看服务器的世界地图。

## 服务器版本

- **Minecraft** 1.20.4（2023/12/07）
- **Fabric** 0.15.10
- **Fabric API** 0.97.0

已关闭正版验证，支持任何玩家访问服务器。

## 派大星都能看懂的加入服务器步骤

### 安装 Plain Craft Launcher

访问 `https://download.towind.fun/PCL2-2.7.1.zip` 或者[爱发电](https://afdian.net/p/0164034c016c11ebafcb52540025c377)下载 Plain Craft Launcher 2，解压到任意目录，打开。

下载与[服务器版本](#服务器版本)相对应的 MC 客户端，如下图所示：

![download-mc-client](./connect-to-my-mc-server/download-mc-client.png)

### （推荐）添加 Auto Modpack 模组

服务器通过 [Auto Modpack](https://modrinth.com/mod/automodpack/version/1ZPaL1PB) 模组自动分发其它的预设模组，您可以下载它并放置在客户端的模组文件夹中（可以在启动器的“版本设置 - 概览 - Mod 文件夹”处快速打开）：

![open-mods-dir](./connect-to-my-mc-server/open-mods-dir.png)

这样的话，在连接服务器前将自动获取最新的预设模组列表。首次进入服务器时会看到下面的内容，点击“下载”即可：

![download-default-mods](./connect-to-my-mc-server/download-default-mods.png)

当然，这**不是**必须的步骤，您可以根据自己的喜好自行组合模组。

### 启动游戏

通过微软 OAuth 2.0 验证，登录到您的 Minecraft 账号，启动游戏：

![start-mc-client-genuine](./connect-to-my-mc-server/start-mc-client-genuine.png)

如果没有购入正版，选择以离线的方式启动游戏：

![start-mc-client](./connect-to-my-mc-server/start-mc-client.png)

### 连接到服务器

选择“多人游戏”，点击“添加服务器”，进入到“编辑服务器信息”页面。其中“服务器名称”可任意填写，例如 `Lolipop_MC_1.20.4_Fabric`；“服务器地址”填写 `mc.towind.fun`；“服务器资源包”设置为 `启用`。如下图所示：

![set-server-info](./connect-to-my-mc-server/set-server-info.png)

连接到服务器即可！

![connect-server](./connect-to-my-mc-server/connect-server.png)

## 服务器预设模组

您可以在 [Modrinth](https://modrinth.com/mods) 或 [CurseForge](https://www.curseforge.com/minecraft/search?class=mc-mods) 找到用于自定义 Minecraft 游玩体验的模组，按需引入。

> 模组需放置在游戏路径的 `mods` 目录下。

服务器预设模组的选择主要依据**流行度 & 关注度**指标。未来可能添加大型服务器模组以拓展可玩性。

![mods-menu](./connect-to-my-mc-server/mods-menu.png)

服务器预设模组列表如下：

### 模组自动分发

当手动添加此模组后，服务器才会自动分发其它预设的非服务端模组。

- [Auto Modpack](https://modrinth.com/mod/automodpack/version/1ZPaL1PB) 4.0.0-beta1

### 游戏拓展

- [Tectonic](https://modrinth.com/datapack/tectonic/version/PFg0zBtc) 2.3.4，服务端模组，生成更加真实的世界地形
- [YUNG's Bridges](https://modrinth.com/mod/yungs-bridges/version/1.20.4-Fabric-4.4.2) 4.4.2，服务端模组，在世界中自动生成桥梁

### 游戏改良

- [Clumps](https://modrinth.com/mod/clumps/version/jdeTwq6v) 15.0.0.2，聚集经验球到一起
- [Double Doors](https://modrinth.com/mod/double-doors/version/1.20.4-5.8-fabric+forge+neo) 5.8，服务端模组，打开连在一起的门
- [Nether Portal Fix](https://modrinth.com/mod/netherportalfix/version/15.0.1+fabric-1.20.4) 15.0.1，服务端模组，修复地狱传送门缺陷

### 体验增强

- [Apple Skin](https://modrinth.com/mod/appleskin/version/2.5.1+mc1.20.3) 2.5.1
- [Inventory Profiles Next](https://modrinth.com/mod/inventory-profiles-next/version/fabric-1.20.3-1.10.10) 1.10.10
- [Journey Map](https://modrinth.com/mod/journeymap/version/1.20.4-5.9.25-fabric) 5.9.25
- [Just Enough Items](https://modrinth.com/mod/jei/version/17.3.0.52) 17.3.0.52
- [Mouse Tweaks](https://modrinth.com/mod/mouse-tweaks/version/1.20-2.26-fabric) 2.26
- [WTHIT](https://modrinth.com/mod/wthit/version/fabric-10.6.0) 10.6.0

### 视觉动画

- [3D Skin Layers](https://modrinth.com/mod/3dskinlayers/version/3a5RPvFY) 1.6.4，不兼容 HD Skins 和 Epic Fight Mod
- [[EMF] Entity Model Features](https://modrinth.com/mod/entity-model-features/version/FTmtYNdf) 2.0.2
- [[ETF] Entity Texture Features](https://modrinth.com/mod/entitytexturefeatures/version/5a6694zO) 6.0.1，模组 [EMF] Entity Model Features 等的必要依赖
- [Fabric Tailor](https://modrinth.com/mod/fabrictailor/version/2.3.1) 2.3.1
- [Iris Shaders](https://modrinth.com/mod/iris/version/1.7.0+1.20.4) 1.7
- [Not Enough Animations](https://modrinth.com/mod/not-enough-animations/version/OwhUSOUM) 1.7.3

### 音效沉浸

- [Sound Physics Remastered](https://modrinth.com/mod/sound-physics-remastered/version/fabric-1.20.4-1.3.1) 1.3.1

### 性能优化

- [Entity Culling](https://modrinth.com/mod/entityculling/version/7JR5qJ8f) 1.6.4
- [Ferrite Core](https://modrinth.com/mod/ferrite-core/version/6.0.3-fabric) 6.0.3
- [Lithium](https://modrinth.com/mod/lithium/version/mc1.20.4-0.12.1) 0.12.1
- [Memory Leak Fix](https://modrinth.com/mod/memoryleakfix/version/v1.1.5) 1.1.5
- [Sodium](https://modrinth.com/mod/sodium/version/mc1.20.4-0.5.8) 0.5.8
- [Starlight](https://modrinth.com/mod/starlight/version/1.1.3+1.20.4) 1.1.3

### 其它模组

- [Bad Packets](https://modrinth.com/mod/badpackets/version/fabric-0.6.1) 0.6.1，模组 WTHIT 等的必要依赖
- [Balm](https://modrinth.com/mod/balm/version/9.0.9+fabric-1.20.4) 9.0.9，模组 Nether Portal Fix 等的必要依赖
- [Better Ping Display](https://modrinth.com/mod/better-ping-display-fabric/version/1.20.4-1.1.1) 1.1.1
- [Better Statistics Screen](https://modrinth.com/mod/better-stats/version/3.9.7+fabric-1.20.4) 3.9.7
- [Chat Heads](https://modrinth.com/mod/chat-heads/version/e4XWJ2pL) 0.12.0
- [Cloth Config API](https://modrinth.com/mod/cloth-config/version/13.0.121+fabric) 13.0.121，模组 YUNG's Bridges 等的必要依赖
- [Collective](https://cdn.modrinth.com/data/e0M1UDsY/versions/yXljDige/collective-1.20.4-7.57.jar) 7.57，模组 Double Doors 等的必要依赖
- [Dynmap](https://modrinth.com/plugin/dynmap/version/fOe507oy) 3.7-beta-4，服务端模组，提供浏览器地图功能
- [Fabric Language Kotlin](https://modrinth.com/mod/fabric-language-kotlin/version/1.10.20+kotlin.1.9.24) 1.10.20+kotlin.1.9.24，模组 Inventory Profiles Next 等的必要依赖
- [libIPN](https://modrinth.com/mod/libipn/version/fabric-1.20.4-4.0.2) 4.0.2，模组 Inventory Profiles Next 等的必要依赖
- [Mod Menu](https://modrinth.com/mod/modmenu/version/9.2.0-beta.2) 9.2.0-beta.2，模组 Inventory Profiles Next 等的必要依赖
- [YUNG's API](https://modrinth.com/mod/yungs-api/version/1.20.4-Fabric-4.4.3) 4.4.3，模组 YUNG's Bridges 等的必要依赖

## 管理员使用的资源包

您可以在 [Modrinth](https://modrinth.com/resourcepacks) 或 [CurseForge](https://www.curseforge.com/minecraft/search?class=texture-packs) 找到用于增强视觉、音效体验等的资源包，按需引入。

> 资源包需放置在游戏路径的 `resourcepacks` 目录下。

作为参考，服务器管理员引入了如下的资源包：

- [Round Trees](https://modrinth.com/resourcepack/round-trees/version/7.1) 7.1
- [Stay True](https://www.curseforge.com/minecraft/texture-packs/stay-true/files/5270000) 1.20.4

在“选项 - 资源包”可以找到相关配置：

![resources-menu](./connect-to-my-mc-server/resources-menu.png)

## 管理员使用的光影包

光影包可以**显著提升**游玩的视觉体验（同时大大提升机器配置要求），您可以在 [Modrinth](https://modrinth.com/shaders?g=categories:%27iris%27) 或 [CurseForge](https://www.curseforge.com/minecraft/search?class=shaders) 找到并下载它们，按需引入。

> 光影包依赖于 [Iris Shaders](https://modrinth.com/mod/iris) 或其它光影加载器。如果您使用了 Auto Modpack 模组，那么 Iris Shaders 将自动被安装。
>
> 首次启动包含光影加载器的游戏时，会在游戏路径下创建 `shaderpacks` 目录，将光影包放置到该目录即可。

作为参考，服务器管理员添加了如下的光影包，在游戏中可以随时切换：

- [Complementary Shaders - Reimagined](https://modrinth.com/shader/complementary-reimagined/version/r5.1.1) 5.1.1，Complementary Shaders 的 MC 质感版本
- [Complementary Shaders - Unbound](https://modrinth.com/shader/complementary-unbound/version/r5.1.1) 5.1.1，Complementary Shaders 的写实版本

在“选项 - 视频设置 - 光影包”可以找到相关配置：

![shaders-menu](./connect-to-my-mc-server/shaders-menu.png)

Complementary Shaders - Reimagined 光影效果展示：

![mc-with-shader](./connect-to-my-mc-server/mc-with-shader.png)

## 自定义皮肤

由于服务器没有开启正版验证，因此将无法正常显示您上传的正版皮肤。

服务器通过 [Fabric Tailor](https://modrinth.com/mod/fabrictailor) 模组实现离线服务器的皮肤自定义功能，在游戏中可以通过 `/skin` 命令设置自己的皮肤，例如：

```bash
# 设置为指定 URL 链接对应的皮肤
/skin set URL classic https://s.namemc.com/i/b80558ff4b834410.png # 经典身材
/skin set URL slim https://s.namemc.com/i/b80558ff4b834410.png # 纤细身材

# 设置为指定正版用户上传的皮肤
/skin set player Lolipop0703
```

换肤效果展示：

![mc-with-shader](./connect-to-my-mc-server/set-skin.png)

## 服务器备份

服务器将在每天的北京时间凌晨 4 点自动进行备份，您可以在[这里](https://1drv.ms/f/s!AmSmGMDAjYJui_5E5oKTM1iPF7OhhQ?e=Sit0PP)找到最近的七个备份文件。
