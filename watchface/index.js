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
  x: px(73),
  y: px(313),
  w: px(334),
  h: px(92)
};


WatchFace({

  onInit() {
    //logger.log('onInit()');
  },

  build() {

    //logger.log('build()');

    hmUI.createWidget(hmUI.widget.IMG, {
      x: 0,
      y: 0,
      w: px(480),
      h: px(480),
      src: 'background.png',
      show_level: hmUI.show_level.ONLY_NORMAL
    });

    hmUI.createWidget(hmUI.widget.IMG, {
      x: 0,
      y: 0,
      w: px(480),
      h: px(480),
      src: 'aod_background.png',
      show_level: hmUI.show_level.ONLY_AOD
    });

    let statusWid = [];
    statusWid.createInd = function(type,img,unit,imp_unit) {
      const group = hmUI.createWidget(hmUI.widget.GROUP, lcdIndPos);
      group.createWidget(hmUI.widget.TEXT_IMG, {
        x: px(12),
        y: px(30),
        w: lcdIndPos.w - px(2*12),
        align_h: hmUI.align.RIGHT,
        type: type,
        font_array: nums,
        unit_en: unit,
        imperial_unit_en: imp_unit,
        show_level: hmUI.show_level.ONLY_NORMAL
      });
      group.createWidget(hmUI.widget.IMG, {
        x: 0,
        y: px(7),
        src: img,
        show_level: hmUI.show_level.ONLY_NORMAL
      });       
      group.setProperty(hmUI.prop.VISIBLE, false);
      this.push(group);   
    };

    const dateWidget = hmUI.createWidget(hmUI.widget.GROUP, lcdIndPos);
    dateWidget.createWidget(hmUI.widget.IMG_DATE, {
      day_startX: px(227),
      day_startY: px(30),
      day_en_array: nums,
      show_level: hmUI.show_level.ONLY_NORMAL | hmUI.show_level.ONLY_AOD
    });

    dateWidget.createWidget(hmUI.widget.IMG_WEEK, {
      x: px(12),
      y: px(30),
      week_en: weekdays,
      show_level: hmUI.show_level.ONLY_NORMAL | hmUI.show_level.ONLY_AOD
    })
    statusWid.push(dateWidget);

    statusWid.createInd( hmUI.data_type.BATTERY,'lcd_ind/lcd_bat.png',"numbers/unit_perc.png");
    statusWid.createInd( hmUI.data_type.WEATHER_CURRENT,'lcd_ind/lcd_temp.png',"numbers/unit_c.png","numbers/unit_f.png");
    statusWid.createInd( hmUI.data_type.STEP,'lcd_ind/lcd_steps.png');
    statusWid.createInd( hmUI.data_type.CAL,'lcd_ind/lcd_kcal.png');

    const battLowInd = hmUI.createWidget(hmUI.widget.IMG_ANIM, {
      x: lcdIndPos.x,
      y: lcdIndPos.y + px(7),
      anim_path: 'lcd_ind/lowbat',
      anim_prefix: 'lcd_lowbat',
      anim_ext: 'png',
      anim_fps: 1,
      anim_size: 2,
      repeat_count: 0,
      anim_status: hmUI.anim_status.STOP,
      show_level: hmUI.show_level.ONLY_NORMAL
    });
    const aodBattLowInd = hmUI.createWidget(hmUI.widget.IMG, {
      x: lcdIndPos.x,
      y: lcdIndPos.y + px(7),
      src: 'lcd_ind/lowbat/lcd_lowbat_0.png',
      show_level: hmUI.show_level.ONLY_AOD
    });

    const batteryStatusIndUpdate = function() {
      const isLow = battery.getCurrent() < 20;
      aodBattLowInd.setProperty(hmUI.prop.VISIBLE, isLow);
      battLowInd.setProperty(hmUI.prop.VISIBLE, isLow);
      battLowInd.setProperty(hmUI.prop.ANIM_STATUS, 
        isLow? hmUI.anim_status.START: hmUI.anim_status.STOP);
    };
    const battery = new Battery();
    battery.onChange( batteryStatusIndUpdate);
    batteryStatusIndUpdate();

    hmUI.createWidget(hmUI.widget.TIME_POINTER, {
      hour_centerX: px(240),
      hour_centerY: px(240),
      hour_posX: px(20),
      hour_posY: px(240),
      hour_path: 'aod_h_hand.png',
      hour_cover_x: 0,
      hour_cover_y: 0,
      minute_centerX: px(240),
      minute_centerY: px(240),
      minute_posX: px(20),
      minute_posY: px(240),
      minute_path: 'aod_m_hand.png',
      enable: false,
      show_level: hmUI.show_level.ONLY_AOD
    });

    hmUI.createWidget(hmUI.widget.TIME_POINTER, {
      hour_centerX: px(240),
      hour_centerY: px(240),
      hour_posX: px(20),
      hour_posY: px(240),
      hour_path: 'h_hand.png',
      hour_cover_x: 0,
      hour_cover_y: 0,
      minute_centerX: px(240),
      minute_centerY: px(240),
      minute_posX: px(20),
      minute_posY: px(240),
      minute_path: 'm_hand.png',
      minute_cover_x: 0,
      minute_cover_y: 0,
      second_centerX: px(240),
      second_centerY: px(240),
      second_posX: px(11),
      second_posY: px(240),
      second_path: 's_hand.png',
      second_cover_x: 0,
      second_cover_y: 0,
      enable: false,
      show_level: hmUI.show_level.ONLY_NORMAL
    }); 

    const button = hmUI.createWidget(hmUI.widget.FILL_RECT, 
      Object.assign(lcdIndPos,{
        color: 0,
        alpha: 0x0,
        show_level: hmUI.show_level.ONLY_NORMAL,
      })
    );

    let timerId = null;
    let activeInd = 0;
    button.addEventListener(hmUI.event.CLICK_DOWN, (p) => {

      if (timerId) {
        clearTimeout(timerId);
        timerId = null;
      }

      statusWid[activeInd].setProperty(hmUI.prop.VISIBLE, false);
      activeInd = (activeInd + 1) % statusWid.length;
      statusWid[activeInd].setProperty(hmUI.prop.VISIBLE, true);

      if (activeInd > 0) {
        timerId = setTimeout( () => {
          timerId = null;
          statusWid[activeInd].setProperty(hmUI.prop.VISIBLE, false);
          activeInd = 0;
          statusWid[activeInd].setProperty(hmUI.prop.VISIBLE, true);    
        },5000);
      }
  });

/*    let secAngle = () => Date.now() % 60000 * 6 / 1000; 
    let secHandle = hmUI.createWidget(hmUI.widget.IMG, {
      x: 0, //240-13,
      y: 0, //240-178,
      w: 480,
      h: 480,
      src: "s_hand.png",
      pos_x: 240-13,
      pos_y: 240-178,
      center_x: 240,
      center_y: 240,
      angle: secAngle(),
      show_level: hmUI.show_level.ONLY_NORMAL
    });

    logger.log('calling setInterval');
    let x = 0;
    setInterval( () => {
      secHandle.setProperty(hmUI.prop.MORE, {
        angle: secAngle()
      });
      //hmUI.redraw();
    },100);*/

    hmUI.createWidget(hmUI.widget.FILL_RECT, {
      x: 0,
      y: 0,
      w: 480,
      h: 480,
      color: "0x000000",
      alpha: 0x40,
      show_level: hmUI.show_level.ONLY_AOD,
    });

  },

  onDestroy() {
    //logger.log('onDestroy()');
  },
})
