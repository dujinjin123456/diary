//@charset "utf-8"

$(function() {
  var IS = true;
  /*
   *assortToDay(year,month,diaryList)每一页的日期
   *countNoneList(year, month, diaryList)处理连续为空的情况
   *genDateList(year, month, diaryList)渲染列表
   *treatData(js, dy)处理请求到的数据
   */
  //按照每一天的日期将数据push进相应的数组
  function assortToDay(year, month, diaryList) {
    var countDay = countDays(year, month); //countDay为某个月有多少天
    var DayList = [];
    var diaryListLenght = diaryList.length;
    if (month < 10) {
      month = '0' + month
    }
    var isConseq = false;
    for (var i = 0; i < countDay; i++) {
      DayList[i] = [];
      var day;
      if (i + 1 < 10) {
        day = '0' + (i + 1)
      } else {
        day = i + 1
      }
      var dayNow = '' + year + month + day;
      for (var j = 0; j < diaryListLenght; j++) {
        var dairtCtime = diaryList[j].ctime.slice(0, 8);
        if (dairtCtime == dayNow) {
          DayList[i].push(diaryList[j]);
        }
      }
    }
    return DayList;
  }

  //处理连续为空的情况
  function countNoneList(year, month, diaryList) {
    var DayList = assortToDay(year, month, diaryList);
    var countDay = DayList.length;
    for (var i = 0; i < countDay; i++) {
      if (DayList[i].length == 0) {
        if (i - 1 < 0) {
          continue;
        };
        if (DayList[i - 1].length == 0) {
          DayList[i - 1].push('isempty');
          DayList[i].push('isempty');
        } else if (DayList[i - 1].length == 1 && DayList[i - 1][0] == 'isempty') {
          DayList[i].push('isempty');
        }
      };
    };
    return DayList;
  }

  //将数据填充进列表
  function genDateList(year, month, diaryList) {
    var DayList = countNoneList(year, month, diaryList);
    $("#noteListBox").html('');
    var noteListInner = '';
    for (var i = 0; i < DayList.length; i++) {
      var fulltime = getFullDate2(year, month, i + 1); //八位日期字符串
      var timeDate = getFullTime(fulltime).timeDate; //日期--
      var weekDay = getFullTime(fulltime).weekDay; //星期几
      if (DayList[i].length == 0) {
        //为空
        noteListInner += '<div class="note-day">';
        noteListInner += '<div class="notelist-title"><p class="notelist-date-noli">' + timeDate + '' + weekDay + '</p><a class="add-note" href="###">添加记事<s class="add-icon"></s></a></div>';
        noteListInner += '</div>';
      } else if (DayList[i].length == 1 && DayList[i][0] == 'isempty') {
        //添加连续的
        if (i - 1 < 0 || !DayList[i - 1] || !(DayList[i - 1].length == 1 && DayList[i - 1][0] == 'isempty')) {
          noteListInner += '<div class="note-day">';
          noteListInner += '<div class="notelist-title"><p class="notelist-date-noli">' + timeDate + '' + weekDay;
          continue;
        };
        if (DayList[i - 1].length == 1 && DayList[i - 1][0] == 'isempty') {
          noteListInner += '';
        };
        if (i + 1 > DayList.length || !DayList[i + 1] || !(DayList[i + 1].length == 1 && DayList[i + 1][0] == 'isempty')) {
          noteListInner += ' ~ ' + timeDate + '' + weekDay + '</p><a class="add-note" href="###">添加记事<s class="add-icon"></s></a></div>';
          noteListInner += '</div>';
        };
      } else {
        noteListInner += '<div class="note-day">';
        noteListInner += '<div class="notelist-title"><p class="notelist-date">' + timeDate + '' + weekDay + '</p><a class="add-note" href="###">添加记事<s class="add-icon"></s></a></div>';
        noteListInner += '<ul>';
        var clockList = '',
          jsList = '',
          dyList = '';
        for (var j = 0; j < DayList[i].length; j++) {
          if (DayList[i][j].flag == 1) {
            jsList += '<li class="js" pid=' + DayList[i][j].pid + '><i class="notelist-tip tip-js"></i><a href="###" class="notelist-text">' + mCutStr(DayList[i][j].subtitle, 111) + '</a></li>'
          } else if (DayList[i][j].flag == 3) {
            clockList += '<li class="js" pid=' + DayList[i][j].pid + '><i class="notelist-tip tip-warning"><i class="clock-icon"></i></i><a href="###" class="notelist-text">' + mCutStr(DayList[i][j].subtitle, 111) + '</a></li>'
          } else if (DayList[i][j].flag == 2) {
            dyList += '<li><i class="notelist-tip tip-zx"></i><a href="'+dyListUrl+'" class="notelist-text">' + DayList[i][j].keys + '等共' + DayList[i][j].length + '条' + '</a></li>'
          }
        }
        noteListInner += clockList + jsList + dyList + '</ul>';
        noteListInner += '</div>';
      }
    }
    $("#noteListBox").html(noteListInner);
    if ($("#jsShow").hasClass('cur')) {
      $(".tip-zx").parents('li').hide();
    }
  }

  //处理请求到的数据
  function treatData(js, dy) {
    var jsArr;
    var diaryList = []; //用于存储所有要填进去列表的数据，包括订阅和记事；
    if ($(js)[0].errorCode == 0) {
      jsArr = $(js)[0].data;
      for (var i = 0; i < jsArr.length; i++) {
        var ctime = getFullDate(jsArr[i].ctime * 1000);
        var clockDate;
        var clock = jsArr[i].clock;
        var subtitle = jsArr[i].subtitle;
        var subcontent = jsArr[i].content;
        var pid = jsArr[i].pid;
        var codename = jsArr[i].codename;
        var clockDate; //提醒时间
        if (clock == 0) { //没有闹钟提醒的时候
          clockDate = 0;
          diaryList.push({
            flag: 1,
            ctime: ctime,
            clockDate: clockDate,
            subtitle: subtitle,
            subcontent: subcontent,
            pid: pid,
            codename: codename
          });
        } else {
          clockDate = getFullDate(clock * 1000);
          diaryList.push({
            flag: 3,
            ctime: ctime,
            clockDate: clockDate,
            subtitle: subtitle,
            subcontent: subcontent,
            pid: pid,
            codename: codename
          });
        }
      }
    }
    if (dy && $(dy)[0] && $(dy)[0].status == 0 && $(dy)[0].data.total != 0) { //有订阅内容才会去执行
      var dylength = $(dy)[0].data.total;
      var dyKeys = $(dy)[0].data.wd; //用于存储订阅的关键字
      var nowYear = getDomainTime().nowYear;
      var nowMonth = getDomainTime().nowMonth;
      var nowDay = getDomainTime().nowDay;
      var ctime = '' + nowYear + (nowMonth < 10 ? '0' + nowMonth : nowMonth) + (nowDay < 10 ? '0' + nowDay : nowDay) + '000000';
      dyKeys = dyKeys.join(',');
      diaryList.push({
        flag: 2,
        ctime: ctime,
        keys: dyKeys,
        length: dylength
      });
    }
    dateSort(diaryList);
    return diaryList;
  }
  /*
   *operateDiary用于日期年月操作
   */
  function operateDate(diaryList) {
    $("#date-pre").click(function() {
      if (IS == false) {
        return;
      } else {
        var currentMonth = parseInt(monthBt.attr('month'));
        var currentYear = parseInt(yearBt.attr('year'));
        var dateObj = countLastDate(currentYear, currentMonth);
        setSelectYear(dateObj.year);
        setSelectMonth(dateObj.month);
        genDateList(dateObj.year, dateObj.month, diaryList);
      }
    });

    $("#date-next").click(function() {
      if (IS == false) {
        return;
      } else {
        var currentMonth = parseInt(monthBt.attr('month'));
        var currentYear = parseInt(yearBt.attr('year'));
        var dateObj = countNextDate(currentYear, currentMonth);
        setSelectYear(dateObj.year);
        setSelectMonth(dateObj.month);
        genDateList(dateObj.year, dateObj.month, diaryList);
      }
    });

    $("#month-select ul li").live('click', function() {
      if (IS == false) {
        return;
      } else {
        var currentYear = parseInt(yearBt.attr('year'));
        var currentMonth = parseInt($(this).attr('month'));
        genSelectMonth(currentMonth);
        monthSelect.hide();
        setSelectMonth(currentMonth);
        genDateList(currentYear, currentMonth, diaryList);
      }
    });

    $("#year-select ul li").live('click', function() {
      if (IS == false) {
        return;
      } else {
        var currentYear = parseInt($(this).attr('year'));
        var currentMonth = parseInt(monthBt.attr('month'));
        genSelectYear(currentYear);
        yearSelect.hide();
        setSelectYear(currentYear);
        genDateList(currentYear, currentMonth, diaryList);
      }
    });

    $("#todayBt").click(function() {
      if (IS == false) {
        return;
      } else {
        if (getMonth() == getDomainTime().nowMonth && getYear() == getDomainTime().nowYear) {
          return;
        } else {
          var nowMonth = getDomainTime().nowMonth;
          var nowYear = getDomainTime().nowYear;
          setSelectYear(nowYear);
          setSelectMonth(nowMonth);
          genDateList(nowYear, nowMonth, diaryList);
        }
      }
    });
  }
  //渲染函数
  function render(nowYear, nowMonth) {
    setSelectYear(nowYear);
    setSelectMonth(nowMonth);
    if (IS == true) {
      IS = false;
      var jsKey = false,
        dyKey = false,
        js = {}, dy = {};
      $.ajax({
        url: jsUrl,
        data: {
          order: 'display_date desc'
        },
        type: 'get',
        dataType: 'json',
        timeout: 5000,
        success: function(data) {
          js = data;
        },
        complete: function() {
          jsKey = true;
          if (dyKey) {
            var diaryList = treatData(js, dy);
            genDateList(nowYear, nowMonth, diaryList);
            IS = true;
            operateDate(diaryList);
          }
        }
      });
      //判断是否是本年本月，若是本年本月则不必再请求订阅部分
      if (nowYear == getDomainTime().nowYear && nowMonth == getDomainTime().nowMonth) {
        $.ajax({
          url: dyUrl,
          type: 'get',
          dataType: 'json',
          timeout: 5000,
          success: function(data) {
            dy = data;
          },
          complete: function() {
            dyKey = true;
            if (jsKey) {
              var diaryList = treatData(js, dy);
              genDateList(nowYear, nowMonth, diaryList);
              IS = true;
              operateDate(diaryList);
            }
          }
        });
      } else {
        dyKey = true;
        IS = true;
        return;
      }
    }
  }

  /*
   *inita初始化
   *edit编辑后的操作
   *add添加记事的操作
   *deleteIf删除记事的操作
   */
  var operateDiary = {
    inita: function() {
      setSelectYear(getDomainTime().nowYear);
      setSelectMonth(getDomainTime().nowMonth);
      render(getDomainTime().nowYear, getDomainTime().nowMonth);
    },
    edit: function(editdata) {
      if (editdata['title'] == '') {
        promptFun('标题不可以为空');
        $(this).parents(".note-pop").find('.subtitle_edit').focus();
        return false;
      }
      if (editor.hasContents() == false) {
        promptFun('内容不可以为空');
        $(this).parents(".note-pop").find('.news_content_edit').focus();
        return false;
      }
      $("#edit_box,#mask_iframe").hide();
      $.ajax({
        url: urlMap.save,
        data: editdata,
        type: 'POST',
        dataType: 'json',
        success: function(data) {
          var errcode = data.errorCode,
            errmsg = data.errorMsg
          if (errcode == 0) {
            tipBox('修改记事成功！');
            render(getYear(), getMonth());
          } else {
            //alert(errmsg);
            tipBox("修改记事失败！")
          }
        },
        error: function(x, status) {
          //alert('error' + ' :' + status);
          tipBox("修改记事失败！");
        }
      });
    },
    add: function(adddata) {
      if (adddata['title'] == '') {
        promptFun('标题不可以为空');
        $(this).parents(".note-pop").find('.subtitle_edit').focus();
        return false;
      }
      if (editor2.hasContents() == false) {
        promptFun('内容不可以为空');
        $(this).parents(".note-pop").find('.news_content_edit').focus();
        return false;
      }
      $("#add_box,#mask_iframe").hide();
      $.ajax({
        url: urlMap.save,
        data: adddata,
        type: 'POST',
        dataType: 'json',
        success: function(data) {
          var errcode = data.errorCode,
            errmsg = data.errorMsg
          if (errcode == 0) {
            tipBox('添加记事成功！');
            render(getYear(), getMonth());
          } else {
            //alert(errmsg);
            tipBox("添加记事失败！");
          }
        },
        error: function(x, status) {
          //alert('error' + ' :' + status);
          tipBox("添加记事失败！");
        }
      });
    },
    deleteIf: function(pid) {
      $("#delete_box,#mask_iframe").show();
      var deleteUrl = 'http://sapi.10jqka.com.cn/index.php?module=blog&controller=api&action=deletepost&userid=' + userid + '&&pid=' + pid + '&type=jsonp&callback=?';
      $("#deleteYes").click(function() {
        $("#delete_box,#show_box").hide();
        $.getJSON(deleteUrl, function(deletemes) {
          if (deletemes.errorCode == 0) {
            tipBox('删除记事成功');
            render(getYear(), getMonth());
          } else {
            tipBox('删除记事失败');
          }
        });
      });
      $("#deleteNo").click(function() {
        $("#delete_box,#mask_iframe,#show_box").hide();
      });
    }
  }

  /*
     *以下是具体各项操作
     *初始化,为各个链接添加自定义codename和code属性
     *查看记事
     *修改记事
     *添加记事
     *删除记事
     */

    /*
     *1、初始化
     *2、为各个链接添加自定义codename和code属性
     */

  operateDiary.inita();

  var autoCode = getUrlParam('code');
  var autoCodeName = getUrlParam('codename');
  var manageUrl = $(".set-ul a").eq(0).attr('href') + '?code=' + autoCode + '&codename=' + autoCodeName; //设置记事管理地址
  var diaryUrl = $(".set-ul a").eq(1).attr('href') + '?code=' + autoCode + '&codename=' + autoCodeName; //设置日历视图链接地址 
  var dyListUrl = 'http://blog.10jqka.com.cn/diary/subscribe.html?&code='+autoCode+'&codename='+autoCodeName;
  $(".set-ul a").eq(0).attr('href', manageUrl);
  $(".set-ul a").eq(1).attr('href', diaryUrl);
  $(".dy-bt").attr('href',dyListUrl);
  /*
   *查看记事
   */

  $(".js").live('click', function() {
    $("#mask_iframe,#show_box").show();
    var pid = $(this).attr('pid');
    showNewsAjax(pid)
  });

  /*
   *编辑记事
   *1、通过修改框里面的修改按钮修改
   *2、保存修改记事
   */

  $("#editBtn").click(function() {
    $("#show_box").hide();
    var pid = $('#pidVal').val();
    var currentUrl = 'http://sapi.10jqka.com.cn/index.php?module=blog&controller=api&action=getStockDiaryDetail&userid=' + userid + '&pid=' + pid + '&type=jsonp&charset=utf8&callback=?';
    $.getJSON(currentUrl, function(data) {
      $("#edit_box,#mask_iframe").show();
      editNews(data, currentUrl);
    });
  });

  $("#edit_saveBtn").click(function() {
    var editdata = editData($(this));
    operateDiary.edit(editdata);
  });

  /*
   *添加记事
   *1、通过每一个项目里面的添加记事按钮（列表或表格）去添加记事
   *2、保存添加记事
   */

  $('.add-note').live('click', function() {
    setAddData(); //填充内容设置为0
    $("#add_box,#mask_iframe").show();
    var add_date = $(this).siblings(".notelist-date").text().slice(0, 10).replace(/-/g, '');
    var display_date = setDispaly_date(add_date);
    $("#add_box .wdate_picker_date").val(display_date);
  });

  $("#add_saveBtn").click(function() {
    var adddata = addData($(this));
    operateDiary.add(adddata);
  });

  /*
   *删除记事
   */

  $("#deleteBtn").click(function() {
    var pid = $(this).parents(".note-pop").find("#pidVal").val();
    var deleteUrl = 'http://sapi.10jqka.com.cn/index.php?module=blog&controller=api&action=deletepost&userid=' + userid + '&&pid=' + pid + '&type=jsonp&callback=?';
    operateDiary.deleteIf(pid);
  });
  
});