# Walking-course-suggestion-app--Walker-
散歩コースを提案するWebアプリ
使用言語：javascripts,html,CSS
使用API：Google社 Maps JavaScript API

概要：
  ユーザが指定した距離の散歩コースを提案する．
  地図上に正方形を作成し，正方形の4つの頂点を経由する散歩コースを生成する．
  生成する正方形の仕様は以下である．
    周囲長は指定距離とする．
    現在地を1つの頂点とする．
    他3つの頂点は，現在地を基準として1辺当たり(指定距離/4)となる正方形を作る条件のもとランダム生成する．

今後の改善点：
  同じ道を往復しないような経路生成
  指定スポットを避けるような機能追加
  散歩時間を基にしたコースの提案（時間/歩行の速さにより距離決定）
