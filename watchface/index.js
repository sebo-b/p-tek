import { log } from '@zos/utils'
//import { Screen } from '@zos/sensor'
import { Battery } from '@zos/sensor'
import * as hmUI from '@zos/ui'

const logger = log.getLogger('sebo_wf');

const weekdays = [
  'weekdays/mon.png',
  'weekdays/tue.png',
  'weekdays/wed.png',
  'weekdays/thu.png',
  'weekdays/fri.png',
  'weekdays/sat.png',
  'weekdays/sun.png',
];

const nums = [
  'numbers/num_0.png',
  'numbers/num_1.png',
  'numbers/num_2.png',
  'numbers/num_3.png',
  'numbers/num_4.png',
  'numbers/num_5.png',
  'numbers/num_6.png',
  'numbers/num_7.png',
  'numbers/num_8.png',
  'numbers/num_9.png'
];

const lcdIndPos = {
  x: 95,
  y: 346,
  w: 290,
  h: 75
};


WatchFace({

  onInit() {
    logger.log('index page.js on init invoke')
  },

  build() {
    logger.log('index page.js on build invoke')

    hmUI.createWidget(hmUI.widget.IMG, {
      x: 0,
      y: 0,
      w: 480,
      h: 480,
      src: 'background.png',
      show_level: hmUI.show_level.ONLY_NORMAL
    });

    hmUI.createWidget(hmUI.widget.IMG, {
      x: 0,
      y: 0,
      w: 480,
      h: 480,
      src: 'aod_background.png',
      show_level: hmUI.show_level.ONLY_AOD
    });

    /*hmUI.createWidget(hmUI.widget.FILL_RECT, {
      x: 0,
      y: 100,
      w: 480,
      h: 50,
      color: "0xFFFF0000",
      show_level: hmUI.show_level.ONLY_NORMAL,
    });*/

    let statusWid = [];

    const dateWidget = hmUI.createWidget(hmUI.widget.GROUP, lcdIndPos);

    dateWidget.createWidget(hmUI.widget.IMG_DATE, {
      day_startX: 186,
      day_startY: 16,
      day_en_array: nums,
      show_level: hmUI.show_level.ONLY_NORMAL | hmUI.show_level.ONLY_AOD
    });

    dateWidget.createWidget(hmUI.widget.IMG_WEEK, {
      x: 10,
      y: 16,
      week_en: weekdays,
      show_level: hmUI.show_level.ONLY_NORMAL | hmUI.show_level.ONLY_AOD
    })

    statusWid.push(dateWidget);

    statusWid.createInd = function(type,img) {
      const group = hmUI.createWidget(hmUI.widget.GROUP, lcdIndPos);
      group.createWidget(hmUI.widget.TEXT_IMG, {
        x: 10,
        y: 16,
        w: lcdIndPos.w - 2*10,
        align_h: hmUI.align.RIGHT,
        type: type,
        font_array: nums,
        show_level: hmUI.show_level.ONLY_NORMAL
      });
      group.createWidget(hmUI.widget.IMG, {
        x: 10,
        y: 4,
        src: img,
        show_level: hmUI.show_level.ONLY_NORMAL
      });       
      group.setProperty(hmUI.prop.VISIBLE, false);
      this.push(group);   
    };

    statusWid.createInd( hmUI.data_type.BATTERY,'lcd_ind/bat.png');
    statusWid.createInd( hmUI.data_type.WEATHER_CURRENT,'lcd_ind/temp.png');
    statusWid.createInd( hmUI.data_type.STEP,'lcd_ind/steps.png');
    statusWid.createInd( hmUI.data_type.CAL,'lcd_ind/kcal.png');

    const button = hmUI.createWidget(hmUI.widget.FILL_RECT, 
      Object.assign(lcdIndPos,{
        color: 0,
        alpha: 0x0,
        show_level: hmUI.show_level.ONLY_NORMAL,
      })
    );

    let timerId = null;
    button.addEventListener(hmUI.event.CLICK_DOWN, (p) => {

      if (timerId) {
        clearTimeout(timerId);
        timerId = null;
      }

      let nextOn = false;
      for (let w of statusWid) {
        let tmp = w.getProperty(hmUI.prop.VISIBLE);
        w.setProperty(hmUI.prop.VISIBLE, nextOn);
        nextOn = tmp;
      }

      if (nextOn) {
        statusWid[0].setProperty(hmUI.prop.VISIBLE, nextOn);
      }
      else {
        timerId = setTimeout( () => {
          timerId = null;
          for (let i = 0; i < statusWid.length; ++i)
            statusWid[i].setProperty(hmUI.prop.VISIBLE, i == 0);
        },5000);
      }

      logger.log('click down');
  });

/*  const screen = new Screen();
  screen.onChange( () => {
//    if (timerId) { // && screen.getStatus() == 2) {
  //   clearTimeout(timerId);
  //    timerId = null;
      for (let i = 0; i < statusWid.length; ++i)
        statusWid[i].setProperty(hmUI.prop.VISIBLE, i == 0);
  });*/

   //hmUI.createWidget(hmUI.widget.GROUP, lcdIndPos); 
    const battLowInd = hmUI.createWidget(hmUI.widget.IMG_ANIM, {
      x: lcdIndPos.x + 10,
      y: lcdIndPos.y + 4,
      anim_path: 'lcd_ind/bat_low',
      anim_prefix: 'bat_low',
      anim_ext: 'png',
      anim_fps: 1,
      anim_size: 2,
      repeat_count: 0,
      anim_status: hmUI.anim_status.START,
      show_level: hmUI.show_level.ONLY_NORMAL
    });
    const aodBattLowInd = hmUI.createWidget(hmUI.widget.IMG, {
      x: lcdIndPos.x + 10,
      y: lcdIndPos.y + 4,
      src: 'lcd_ind/bat_low/bat_low_0.png',
      show_level: hmUI.show_level.ONLY_AOD
    });       

    const battery = new Battery();
    const batteryStatusIndUpdate = function() {
      const isLow = battery.getCurrent() < 15;
      battLowInd.setProperty(hmUI.prop.VISIBLE, isLow);
      aodBattLowInd.setProperty(hmUI.prop.VISIBLE, isLow);
    };
    battery.onChange( batteryStatusIndUpdate);
    batteryStatusIndUpdate();

    hmUI.createWidget(hmUI.widget.TIME_POINTER, {
      hour_centerX: 240,
      hour_centerY: 240,
      hour_posX: 21,
      hour_posY: 117,
      hour_path: 'aod_h_hand.png',
      hour_cover_x: 0,
      hour_cover_y: 0,
      minute_centerX: 240,
      minute_centerY: 240,
      minute_posX: 21,
      minute_posY: 195,
      minute_path: 'aod_m_hand.png',
      enable: false,
      show_level: hmUI.show_level.ONLY_AOD
    });

    hmUI.createWidget(hmUI.widget.TIME_POINTER, {
      hour_centerX: 240,
      hour_centerY: 240,
      hour_posX: 21,
      hour_posY: 117,
      hour_path: 'h_hand.png',
      hour_cover_x: 0,
      hour_cover_y: 0,
      minute_centerX: 240,
      minute_centerY: 240,
      minute_posX: 21,
      minute_posY: 195,
      minute_path: 'm_hand.png',
      minute_cover_x: 0,
      minute_cover_y: 0,
/*      second_centerX: 240,
      second_centerY: 240,
      second_posX: 12,
      second_posY: 178,
      second_path: 's_hand.png',
      second_cover_x: 0,
      second_cover_y: 0,
      enable: false,*/
      show_level: hmUI.show_level.ONLY_NORMAL
    }); 

    hmUI.createWidget(hmUI.widget.IMG, {
      x: 0,
      y: 0,
      src: "s_hand.png",
      pos_x: 12,
      pos_y: 178,
      center_x: 240,
      center_y: 240
    });
    
    hmUI.createWidget(hmUI.widget.FILL_RECT, {
      x: 0,
      y: 0,
      w: 480,
      h: 480,
      color: "0x000000",
      alpha: 0x80,
      show_level: hmUI.show_level.ONLY_AOD,
    });


  },

  onDestroy() {
    logger.log('index page.js on destroy invoke')
  },
})
