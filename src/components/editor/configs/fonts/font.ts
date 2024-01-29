const isSupportFontFamily = function (f) {

  //    f是要检测的字体
  if (typeof f != "string") {
    return false
  }
  //    h是基础字体
  let h = "Arial";
  if (f.toLowerCase() == h.toLowerCase()) {
    return true
  }
  //    设置一个检测的字符A,看他是否支持f字体
  let e = "a";
  let d = 100;
  let a = 100,
    i = 100;
  let c = document.createElement("canvas");
  let b = c.getContext('2d', { willReadFrequently: true });
  c.width = a;
  c.height = i;
  b.textAlign = "center";
  b.fillStyle = "black";
  b.textBaseline = "middle";
  let g = function (j) {
    b.clearRect(0, 0, a, i);
    //        字体是传入的j,或者是默认的h
    b.font = d + "px " + j + ", " + h;
    b.fillText(e, a / 2, i / 2);
    //        获取所有的canvas图片信息
    let k = b.getImageData(0, 0, a, i).data;
    //        k调用数组的 filter方法,筛选符合条件的。改变原数组。
    return [].slice.call(k).filter(function (l) {
      return l != 0
    });
  };
  //    返回结果,如果h默认字体和输入待检测字体f.通过g函数检测得到的字符串不一致,说明自提生效
  return g(h).join("") !== g(f).join("");
};


const isSupportFontFamilySync = function (f) {
  return new Promise((resolve, rejected) => {
    resolve(isSupportFontFamily(f))
  })
}


//穷举字体
const fontTypes = {
  windows: [
    { ch: 'Arial', en: 'Arial' },
    { ch: 'Helvetica', en: 'Helvetica' },
    { ch: 'Arial Black', en: 'Arial Black' },
    { ch: 'Calibri', en: 'Calibri' },
    { ch: 'Constantia', en: 'Constantia' },
    { ch: 'Frutiger', en: 'Frutiger' },
    { ch: 'Futura', en: 'Futura' },
    { ch: 'Corbel', en: 'Corbel' },
    { ch: 'Roboto', en: 'Roboto' },
    { ch: 'Montserrat', en: 'Montserrat' },
    { ch: 'Bebas Neue', en: 'Bebas Neue' },
    { ch: 'Monument Extended', en: 'Monument Extended' },
    { ch: 'D-DIN', en: 'D-DIN' },
    {
      ch: '宋体',
      en: 'SimSun'
    }, {
      ch: '黑体',
      en: 'SimHei'
    }, {
      ch: '微软雅黑',
      en: 'Microsoft Yahei'
    }, {
      ch: '微软正黑体',
      en: 'Microsoft JhengHei'
    }, {
      ch: '楷体',
      en: 'KaiTi'
    }, {
      ch: '新宋体',
      en: 'NSimSun'
    }, {
      ch: '仿宋',
      en: 'FangSong'
    }],
  'OS X': [{
    ch: '苹方',
    en: 'PingFang SC'
  }, {
    ch: '华文黑体',
    en: 'STHeiti'
  }, {
    ch: '华文楷体',
    en: 'STKaiti'
  }, {
    ch: '华文中宋',
    en: 'STZhongsong'
  }, {
    ch: '华文琥珀',
    en: 'STHupo'
  }, {
    ch: '华文新魏',
    en: 'STXinwei'
  }, {
    ch: '华文隶书',
    en: 'STLiti'
  }, {
    ch: '华文行楷',
    en: 'STXingkai'
  }, {
    ch: '冬青黑体简',
    en: 'Hiragino Sans GB'
  }, {
    ch: '兰亭黑-简',
    en: 'Lantinghei SC'
  }, {
    ch: '翩翩体-简',
    en: 'Hanzipen SC'
  }, {
    ch: '手札体-简',
    en: 'Hannotate SC'
  }, {
    ch: '宋体-简',
    en: 'Songti SC'
  }, {
    ch: '娃娃体-简',
    en: 'Wawati SC'
  }, {
    ch: '魏碑-简',
    en: 'Weibei SC'
  }, {
    ch: '行楷-简',
    en: 'Xingkai SC'
  }, {
    ch: '雅痞-简',
    en: 'Yapi SC'
  }, {
    ch: '圆体-简',
    en: 'Yuanti SC'
  }],
  'office': [{
    ch: '幼圆',
    en: 'YouYuan'
  }, {
    ch: '隶书',
    en: 'LiSu'
  }, {
    ch: '华文细黑',
    en: 'STXihei'
  }, {
    ch: '华文宋体',
    en: 'STSong'
  }, {
    ch: '华文仿宋',
    en: 'STFangsong'
  }, {
    ch: '华文中宋',
    en: 'STZhongsong'
  }, {
    ch: '华文彩云',
    en: 'STCaiyun'
  }, {
    ch: '华文琥珀',
    en: 'STHupo'
  }, {
    ch: '华文新魏',
    en: 'STXinwei'
  }, {
    ch: '华文隶书',
    en: 'STLiti'
  }, {
    ch: '华文行楷',
    en: 'STXingkai'
  }, {
    ch: '方正舒体',
    en: 'FZShuTi'
  }, {
    ch: '方正姚体',
    en: 'FZYaoti'
  }],
  'open': [{
    ch: '思源黑体',
    en: 'Source Han Sans CN'
  }, {
    ch: '思源宋体',
    en: 'Source Han Serif SC'
  }, {
    ch: '文泉驿微米黑',
    en: 'WenQuanYi Micro Hei'
  }],
  'hanyi': [{
    ch: '汉仪旗黑',
    en: 'HYQihei 40S'
  }, {
    ch: '汉仪旗黑',
    en: 'HYQihei 50S'
  }, {
    ch: '汉仪旗黑',
    en: 'HYQihei 60S'
  }, {
    ch: '汉仪大宋简',
    en: 'HYDaSongJ'
  }, {
    ch: '汉仪楷体',
    en: 'HYKaiti'
  }, {
    ch: '汉仪家书简',
    en: 'HYJiaShuJ'
  }, {
    ch: '汉仪PP体简',
    en: 'HYPPTiJ'
  }, {
    ch: '汉仪乐喵体简',
    en: 'HYLeMiaoTi'
  }, {
    ch: '汉仪小麦体',
    en: 'HYXiaoMaiTiJ'
  }, {
    ch: '汉仪程行体',
    en: 'HYChengXingJ'
  }, {
    ch: '汉仪黑荔枝',
    en: 'HYHeiLiZhiTiJ'
  }, {
    ch: '汉仪雅酷黑W',
    en: 'HYYaKuHeiW'
  }, {
    ch: '汉仪大黑简',
    en: 'HYDaHeiJ'
  }, {
    ch: '汉仪尚魏手书W',
    en: 'HYShangWeiShouShuW'
  }],
  'fangzheng': [{
    "ch": "方正粗雅宋简体",
    "en": "FZYaSongS-B-GB"
  }, {
    "ch": "方正报宋简体",
    "en": "FZBaoSong-Z04S"
  }, {
    "ch": "方正粗圆简体",
    "en": "FZCuYuan-M03S"
  }, {
    "ch": "方正大标宋简体",
    "en": "FZDaBiaoSong-B06S"
  }, {
    "ch": "方正大黑简体",
    "en": "FZDaHei-B02S"
  }, {
    "ch": "方正仿宋简体",
    "en": "FZFangSong-Z02S"
  }, {
    "ch": "方正黑体简体",
    "en": "FZHei-B01S"
  }, {
    "ch": "方正琥珀简体",
    "en": "FZHuPo-M04S"
  }, {
    "ch": "方正楷体简体",
    "en": "FZKai-Z03S"
  }, {
    "ch": "方正隶变简体",
    "en": "FZLiBian-S02S"
  }, {
    "ch": "方正隶书简体",
    "en": "FZLiShu-S01S"
  }, {
    "ch": "方正美黑简体",
    "en": "FZMeiHei-M07S"
  }, {
    "ch": "方正书宋简体",
    "en": "FZShuSong-Z01S"
  }, {
    "ch": "方正舒体简体",
    "en": "FZShuTi-S05S"
  }, {
    "ch": "方正水柱简体",
    "en": "FZShuiZhu-M08S"
  }, {
    "ch": "方正宋黑简体",
    "en": "FZSongHei-B07S"
  }, {
    "ch": "方正宋三简体",
    "en": "FZSong"
  }, {
    "ch": "方正魏碑简体",
    "en": "FZWeiBei-S03S"
  }, {
    "ch": "方正细等线简体",
    "en": "FZXiDengXian-Z06S"
  }, {
    "ch": "方正细黑一简体",
    "en": "FZXiHei I-Z08S"
  }, {
    "ch": "方正细圆简体",
    "en": "FZXiYuan-M01S"
  }, {
    "ch": "方正小标宋简体",
    "en": "FZXiaoBiaoSong-B05S"
  }, {
    "ch": "方正行楷简体",
    "en": "FZXingKai-S04S"
  }, {
    "ch": "方正姚体简体",
    "en": "FZYaoTi-M06S"
  }, {
    "ch": "方正中等线简体",
    "en": "FZZhongDengXian-Z07S"
  }, {
    "ch": "方正准圆简体",
    "en": "FZZhunYuan-M02S"
  }, {
    "ch": "方正综艺简体",
    "en": "FZZongYi-M05S"
  }, {
    "ch": "方正彩云简体",
    "en": "FZCaiYun-M09S"
  }, {
    "ch": "方正隶二简体",
    "en": "FZLiShu II-S06S"
  }, {
    "ch": "方正康体简体",
    "en": "FZKangTi-S07S"
  }, {
    "ch": "方正超粗黑简体",
    "en": "FZChaoCuHei-M10S"
  }, {
    "ch": "方正新报宋简体",
    "en": "FZNew BaoSong-Z12S"
  }, {
    "ch": "方正新舒体简体",
    "en": "FZNew ShuTi-S08S"
  }, {
    "ch": "方正黄草简体",
    "en": "FZHuangCao-S09S"
  }, {
    "ch": "方正少儿简体",
    "en": "FZShaoEr-M11S"
  }, {
    "ch": "方正稚艺简体",
    "en": "FZZhiYi-M12S"
  }, {
    "ch": "方正细珊瑚简体",
    "en": "FZXiShanHu-M13S"
  }, {
    "ch": "方正粗宋简体",
    "en": "FZCuSong-B09S"
  }, {
    "ch": "方正平和简体",
    "en": "FZPingHe-S11S"
  }, {
    "ch": "方正华隶简体",
    "en": "FZHuaLi-M14S"
  }, {
    "ch": "方正瘦金书简体",
    "en": "FZShouJinShu-S10S"
  }, {
    "ch": "方正细倩简体",
    "en": "FZXiQian-M15S"
  }, {
    "ch": "方正中倩简体",
    "en": "FZZhongQian-M16S"
  }, {
    "ch": "方正粗倩简体",
    "en": "FZCuQian-M17S"
  }, {
    "ch": "方正胖娃简体",
    "en": "FZPangWa-M18S"
  }, {
    "ch": "方正宋一简体",
    "en": "FZSongYi-Z13S"
  }, {
    "ch": "方正剪纸简体",
    "en": "FZJianZhi-M23S"
  }, {
    "ch": "方正流行体简体",
    "en": "FZLiuXingTi-M26S"
  }, {
    "ch": "方正祥隶简体",
    "en": "FZXiangLi-S17S"
  }, {
    "ch": "方正粗活意简体",
    "en": "FZCuHuoYi-M25S"
  }, {
    "ch": "方正胖头鱼简体",
    "en": "FZPangTouYu-M24S"
  }, {
    "ch": "方正卡通简体",
    "en": "FZKaTong-M19S"
  }, {
    "ch": "方正艺黑简体",
    "en": "FZYiHei-M20S"
  }, {
    "ch": "方正水黑简体",
    "en": "FZShuiHei-M21S"
  }, {
    "ch": "方正古隶简体",
    "en": "FZGuLi-S12S"
  }, {
    "ch": "方正幼线简体",
    "en": "FZYouXian-Z09S"
  }, {
    "ch": "方正启体简体",
    "en": "FZQiTi-S14S"
  }, {
    "ch": "方正小篆体",
    "en": "FZXiaoZhuanTi-S13T"
  }, {
    "ch": "方正硬笔楷书简体",
    "en": "FZYingBiKaiShu-S15S"
  }, {
    "ch": "方正毡笔黑简体",
    "en": "FZZhanBiHei-M22S"
  }, {
    "ch": "方正硬笔行书简体",
    "en": "FZYingBiXingShu-S16S"
  }]
};


// 系统默认字体
const rootFontFamily = (document.documentElement.currentStyle ? document.documentElement.currentStyle : window.getComputedStyle(document.documentElement)).fontFamily;
//支持的字体
const FONTS = []
for (let key in fontTypes) {
  let fontType = fontTypes[key];
  fontType.forEach(font => {
    let fontEn = font.en, fontCh = font.ch;
    // 检测是否为系统默认字体

    // let support = document.fonts.check("14px '" + fontEn + "'", "Abc123")
    // let support = isSupportFontFamily(fontEn)
    // if (support) {
    //   if (fontEn.toLowerCase() === rootFontFamily.toLowerCase() || ("\"" + fontEn + "\"").toLowerCase() === rootFontFamily.toLowerCase()
    //     || fontCh.toLowerCase() === rootFontFamily.toLowerCase() || ("\"" + fontCh + "\"").toLowerCase() === rootFontFamily.toLowerCase()) {
    //     font.isSystemDefault = true;
    //   }
    //   //加入数据源
    //   FONTS.push(font)
    // }
    isSupportFontFamilySync(fontEn).then(support => {
      if (support) {
        if (fontEn.toLowerCase() === rootFontFamily.toLowerCase() || ("\"" + fontEn + "\"").toLowerCase() === rootFontFamily.toLowerCase()
          || fontCh.toLowerCase() === rootFontFamily.toLowerCase() || ("\"" + fontCh + "\"").toLowerCase() === rootFontFamily.toLowerCase()) {
          font.isSystemDefault = true;
        }
        //加入数据源
        FONTS.push(font)
      }
    })
  });
};

export default FONTS;


