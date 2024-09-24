import { zen2han } from './zen2han'

/**
 * 入力された住所に対して以下の正規化を予め行う。
 *
 * 1. `1-2-3` や `四-五-六` のようなフォーマットのハイフンを半角に統一。
 * 2. 町丁目以前にあるスペースをすべて削除。
 * 3. 最初に出てくる `1-` や `五-` のような文字列を町丁目とみなして、それ以前のスペースをすべて削除する。
 */
export function prenormalize(input: string): string {
  return (
    input
      .normalize('NFC')
      .replace(/　/g, ' ')
      .replace(/ +/g, ' ')
      .replace(/([０-９Ａ-Ｚａ-ｚ]+)/g, (match) => {
        // 全角のアラビア数字は問答無用で半角にする
        return zen2han(match)
      })
      // 数字の後または数字の前にくる横棒はハイフンに統一する
      .replace(
        /([0-9０-９一二三四五六七八九〇十百千][-－﹣−‐⁃‑‒–—﹘―⎯⏤ーｰ─━])|([-－﹣−‐⁃‑‒–—﹘―⎯⏤ーｰ─━])[0-9０-９一二三四五六七八九〇十]/g,
        (match) => {
          return match.replace(/[-－﹣−‐⁃‑‒–—﹘―⎯⏤ーｰ─━]/g, '-')
        },
      )
      .replace(/(.+)(丁目?|番(町|地|丁)|条|軒|線|(の|ノ)町|地割)/, (match) => {
        return match.replace(/ /g, '') // 町丁目名以前のスペースはすべて削除
      })
      .replace(/(.+)((郡.+(町|村))|((市|巿).+(区|區)))/, (match) => {
        return match.replace(/ /g, '') // 区、郡以前のスペースはすべて削除
      })
      .replace(/.+?[0-9一二三四五六七八九〇十百千]-/, (match) => {
        return match.replace(/ /g, '') // 1番はじめに出てくるアラビア数字以前のスペースを削除
      })
  )
}
