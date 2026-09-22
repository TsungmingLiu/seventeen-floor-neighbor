# 林澄路線 Context

第二角色線的垂直切片。玩家仍住 1703，林澄剛搬進 1704，職業是夜班聲音剪輯師。

## 角色與語氣

- 林澄 25 歲，觀察細、說話短，不故作神秘；她會用聲音描述空間與情緒。
- 她的親近方式是分享耳機、錄音與沉默，而不是直接調情。
- 路線氣氛是雨後深夜、城市環境音與安靜陪伴，避免複製許棠的吐槽節奏。

## 狀態與結構

- `curiosity`：玩家願不願意注意她所注意的細節。
- `trust`：玩家是否尊重錄音和她的工作界線。
- `warmth`：玩家是否讓安靜的相處變得舒服。
- `sound_branch` 根據 `warmth >= 2` 顯示不同的一小段回應，但匯回同一結局。

## 路由提示

- 劇情來源：`content/routes/lin-cheng/story.json`
- 角色設定：`content/characters/lin_cheng.json`
- 精準修改前執行 `npm run context -- --route lin-cheng --node <node-id>`。
