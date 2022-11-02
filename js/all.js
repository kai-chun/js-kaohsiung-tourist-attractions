const dataUrl = "https://api.kcg.gov.tw/api/service/get/9c8e1450-e833-499c-8320-29b36b7ace5c";
var attractionList = document.querySelector('.attractionList');
var areaSelect = document.querySelector('#areaSelect');
var areaTitle = document.querySelector('.title');
var popularAreas = document.querySelector('.popularAreas');
var goTopBtn = document.querySelector('.goTop');

var pureData = [];
var data = [];
var zipDict = {};

// 初始化
$.ajax({
    url: dataUrl,
    method: 'GET',
    dataType: 'json',
    async: true,

    success: function (res) {
        pureData = res['data']['XML_Head']['Infos']['Info'];
        getData(pureData,-1);
        renderData(data, 0);
        renderSelectOption(zipDict);
    },
    error: function (error) {
        console.log(error);
    },
});

// 選擇任意行政區後，調整內容
areaSelect.addEventListener('change',getAreaAttraction,false);
function getAreaAttraction(e){
    e.preventDefault();
}

// 選擇熱門行政區後，調整內容
popularAreas.addEventListener('click',getPopularAttraction,false);
function getPopularAttraction(e){
    if (e.target.nodeName != "A") {return;}
    e.preventDefault();
    let zipCode = e.target.className.slice(-3);
    areaTitle.innerHTML = zipDict[zipCode];
    areaTitle.className = "";
    areaTitle.classList.add('title', e.target.className);
    data = [];
    getData(pureData,zipCode);
    renderData(data, 0);
}

// 處理 goTop 按鈕出現的條件
window.onscroll = function scrolltop(){ 
    if (document.documentElement.scrollTop > 600){
        $('.goTop').fadeIn();
    }else{
        $('.goTop').fadeOut();
    }
}

// 
goTopBtn.addEventListener('click',goTop,false);
function goTop(e) {
    e.preventDefault();
    $('html, body').animate({
        scrollTop: 0
    }, 500);
}

// 取得對應區域的景點，若 zipCode = -1，表示顯示所有景點
function getData(pureData, zipCode) {
    for (let i = 0; i < pureData.length; i++){
        let item = pureData[i];

        // 收集 zipcode 及對應的行政區
        if (zipCode == -1) {
            let beginIndex = item['Add'].indexOf(item['Zipcode']);
            let area = item['Add'].substr(beginIndex+3,3);
            zipDict[item['Zipcode']] = area;
        }

        if (zipCode != -1 && item['Zipcode'] != zipCode) continue;
        let attraction = {
            name: item['Name'],
            zipCode: item['Zipcode'],
            openTime: item['Opentime'],
            address: item['Add'],
            tel: item['Tel'],
            ticketInfo: item['Ticketinfo'],
            imgSrc: item['Picture1'],
            imgAlt: item['Picdescribe1']
        };
        data.push(attraction);
    }
}

// 將景點資訊渲染到畫面上，beginIndex 為頁數
function renderData(data, beginIndex){
    let str = "";
    let minNum = Math.min(data.length, beginIndex+8);
    for (let i = beginIndex; i < minNum; i++) {
        let element = data[i];
        str += '<li> \
            <img src="'+ element.imgSrc + '" alt="#"> \
            <div class="attractionTitle"> \
            <h3>' + element.name + '</h3> \
            <p>' + zipDict[element.zipCode] + '</p> \
            </div> \
            <ul class="attractionInfo"> \
                <li> \
                    <div><img src="img/icons_clock.png" alt="open time"></div>' +
                    element.openTime + 
                '</li> \
                <li> \
                    <div><img src="img/icons_pin.png" alt="address"></div>' +
                    element.address + 
                '</li> \
                <li> \
                    <div><img src="img/icons_phone.png" alt="tel"></div>' +
                    element.tel + 
                '</li> \
            </ul> \
            <span> \
                <img src="img/icons_tag.png" alt="ticket info">';
        if (element.ticketInfo == "" || element.ticketInfo == "免費參觀") {
            str += "免費參觀";
        }
        str += '</span></li>';
    }
    attractionList.innerHTML = str;
}

// 將可選擇的行政區渲染到 areaSelect 中
function renderSelectOption(zipDict){
    let str = "";
    let zipCodeList = Object.keys(zipDict);
    for (let i = 0; i < zipCodeList.length; i++){
        str += '<option value="' + zipCodeList[i] + '">' + zipDict[zipCodeList[i]] + '</option>';
    }
    areaSelect.innerHTML += str;
}