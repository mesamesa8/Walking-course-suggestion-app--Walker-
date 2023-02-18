/*
 * 散歩コースを提案するスクリプト
 * 利用者の現在地を1つの頂点とし，周囲が指定距離となる正方形を作るように3つの頂点を決定する
 * 上記で決定された4つの頂点を経由する経路を表示することで散歩コースを提案する
 * 3つの頂点の決定にはランダム値を使用し，散歩コースは毎度違ったものが表示される（同じ散歩コースで飽きることを避ける）．
 */

const R = Math.PI / 180;            //ラジアン変換
const lpl =  0.0109664047;          //1kmあたりの緯度経度を計算するための値
const AdjustedNum = 0.9;            //入力距離と提案コースの距離を調整する値
var length = 2.0;                   //デフォルト距離

//現在地及び経由地の初期化（緯度経度をそれぞれ0.0とする）
var ret = new Array(4);
for (var i = 0; i < ret.length; i++){
    ret[i] = new Array(2);
        ret[i]["lat"] = 0.0;
        ret[i]["lng"] = 0.0;
        console.log("ret[",i,"]:",ret[i]);
}

//エンターキー入力受付
function pressenter(){
    initMap();
    return false;
}

//経由地セット
function setret(length, ret){
    var radian = Math.random() * ( 2 * Math.PI );
    ret[1]['lat'] = ret[0]['lat'] + ((length / 4) * lpl) * Math.cos(radian);
    ret[1]['lng'] = ret[0]['lng'] + ((length / 4) * lpl) * Math.sin(radian);
    ret[2]['lat'] = ret[1]['lat'] + ((length / 4) * lpl) * Math.cos(radian + Math.PI / 2);
    ret[2]['lng'] = ret[1]['lng'] + ((length / 4) * lpl) * Math.sin(radian + Math.PI / 2);
    ret[3]['lat'] = ret[2]['lat'] + ((length / 4) * lpl) * Math.cos(radian + Math.PI);
    ret[3]['lng'] = ret[2]['lng'] + ((length / 4) * lpl) * Math.sin(radian + Math.PI);
    return;
}

//経由地をマップに設定
function pin(length, ret){
    setret(length, ret);
    marker2 = new google.maps.Marker({
        position: ret[1],
        title: "Pin2",
    });
    marker3 = new google.maps.Marker({
        position: ret[2],
        title: "Pin3",
    });
    marker4 = new google.maps.Marker({
        position: ret[3],
        title: "Pin4",
    });
    return;
}

//散歩コース提案
function initMap() {
    length = Number(document.getElementById("length").value);   //入力距離数値を取得
    if(isNaN(length)){                                          //無効な値の場合はエラー出力（小数点を2つ以上含む場合など）
        alert("無効な値です");
    }
    var unit = "";
    var kmelements = document.getElementsByName("unit");        //ラジオボタンの入力を取得（"km" or "m"）
    for (var i = 0, len = kmelements.length; i < len; i++) {
        if (kmelements[i].checked) {
        unit = kmelements[i].value
        }
    }
    if (unit == "m"){                                           //ラジオボタンの入力が"m"なら距離をkm単位に変換
        length = length / 1000;
    }
    if (length > 100){                                          //距離が100km以上ならエラー出力（100km以上の散歩は想定しない）
        //エラー
        alert("距離が長すぎます（100kmまで）");
        return;
    }
    length *= AdjustedNum;                                      //入力距離と提案散歩コースの距離を調節

    //現在位置の取得を許可させ、位置を取得する
    if( navigator.geolocation ){
        navigator.geolocation.getCurrentPosition(
        function( pos ){ //位置取得成功
        ret[0]['lat'] = pos.coords.latitude; //緯度
        ret[0]['lng'] = pos.coords.longitude; //経度

        //位置を指定して、Google mapに表示する
        var mapPosition = {}
        mapPosition["lat"] = ret[0]['lat'];
        mapPosition["lng"] = ret[0]['lng'];
        var mapArea = document.getElementById('maps');
        var mapOptions = {
            center: mapPosition,
            zoom: 15,
        };
        var map = new google.maps.Map(mapArea, mapOptions);

    //現在地にマーカーを付ける
    var marker = new google.maps.Marker({
        position: mapPosition,
        title:"Your location"
    });
    marker.setMap(map);
    pin(length, ret);

    //散歩経路表示
    var request = {
        origin: ret[0],        // 出発地
        destination: ret[0],   // 目的地
        waypoints: [        // 経由地点(指定なしでも可)
            { location: new google.maps.LatLng(ret[1]['lat'],ret[1]['lng']) },
            { location: new google.maps.LatLng(ret[2]['lat'],ret[2]['lng']) },
            { location: new google.maps.LatLng(ret[3]['lat'],ret[3]['lng']) },
        ],
        travelMode: google.maps.DirectionsTravelMode.WALKING, // 交通手段(歩行)
        unitSystem: google.maps.DirectionsUnitSystem.METRIC
    };
    var d = new google.maps.DirectionsService(); // ルート検索オブジェクト
    var r = new google.maps.DirectionsRenderer({ // ルート描画オブジェクト
        map: map, // 描画先の地図
        suppressMarkers : true
    });

    // ルート検索
    d.route(request, function(result, status){
            // OKの場合ルート描画
            if (status == google.maps.DirectionsStatus.OK) {
                r.setDirections(result);
                var actuallength =
                Math.round(google.maps.geometry.spherical.computeDistanceBetween(ret[0], ret[1]))
                + Math.round(google.maps.geometry.spherical.computeDistanceBetween(ret[1], ret[2]))
                + Math.round(google.maps.geometry.spherical.computeDistanceBetween(ret[2], ret[3]))
                + Math.round(google.maps.geometry.spherical.computeDistanceBetween(ret[3], ret[0]));
            }
        }
    );
    result( ret[0] );
},
function( error ){ //失敗
    switch( error.code ){
    case 1: ret[0]['msg'] = "位置情報の利用が許可されていません"; break;
    case 2: ret[0]['msg'] = "デバイスの位置が判定できません"; break;
    case 3: ret[0]['msg'] = "タイムアウトしました"; break;
    }
    result( ret[0] );
}
);
} else { //使用不可のブラウザ
    ret[0]['msg'] = 'このブラウザでは位置取得が出来ません。';
    result( ret[0] );
}
}