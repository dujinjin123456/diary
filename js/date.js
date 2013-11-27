  //@charset "utf-8"
$(function () {

  //日历排序
  function sortDiary(currentYear,currentMonth){
      var lastYear = countLastDate(currentYear,currentMonth).year;//上一个月的年份
      var lastMonth = countLastDate(currentYear,currentMonth).month;//上一个月的月份
      var nextYear = countNextDate(currentYear,currentMonth).year;//下一个月的年份
      var nextMonth = countNextDate(currentYear,currentMonth).month;//下一个月的月份
      var firstDay = fngetday(currentYear, currentMonth, 1); //这个月的一号星期几
      var countNowDays = countDays(currentYear, currentMonth); //这个月的天数
      var lastDay = fngetday(currentYear, currentMonth, countNowDays); //这个月的最后一天星期几
      var countLastDays = countDays(lastYear, lastMonth); //上个月的天数
      var arrDate = [];
      var arrDateLength = 0;
      var lastDays = 0;//上个月排进去的天数。
      //上个月排进日历
      for (var j = 0; j < firstDay; j++) {
        var fulldate = ''+lastYear+(lastMonth<10?'0'+lastMonth:lastMonth)+(countLastDays - firstDay + j + 1);//八位数的年月日
        var weekDay = fngetday(lastYear,lastMonth,(countLastDays - firstDay + j + 1));
        var dateOnly = countLastDays - firstDay + j + 1;
        arrDate.push({fulldate:fulldate,weekDay:weekDay,dateOnly:dateOnly});
        arrDateLength++;
        lastDays++;
      }
      //本月排进日历
      for(var k = 1; k <= countNowDays; k++){
        var fulldate = ''+currentYear+(currentMonth<10?'0'+currentMonth:currentMonth)+(k<10?'0'+k:k);
        var weekDay = fngetday(currentYear,currentMonth,k);
        var dateOnly = k;
        arrDate.push({fulldate:fulldate,weekDay:weekDay,dateOnly:dateOnly});
        arrDateLength++;
      }
      //判断是否需要排进下个月的
      var q = 1;
      if(arrDateLength%7!=0){   
        while(q<= 7-arrDateLength%7){
          nextDays = q;
          var fulldate = ''+nextYear+(nextMonth<10?'0'+nextMonth:nextMonth)+'0'+q;
          var weekDay = fngetday(nextYear,nextMonth,q);
          var dateOnly = q;
          arrDate.push({fulldate:fulldate,weekDay:weekDay,dateOnly:dateOnly});
          q++;
        }
      }
      arrDateLength = arrDate.length;
    return{
      diaryLength:arrDateLength,//这个日历一共多少天
      diaryTime:arrDate,//日历数组
      lastDays:lastDays,
      countNowDays:countNowDays
    }
  }

  //待填充的日历具体内容
  function sortDiaryContent(year,month,diaryList){
     var diaryTimeObj =  sortDiary(year,month).diaryTime;
     var diaryLength = sortDiary(year,month).diaryLength;
     var diaryContent = [];//用于存储待填充的具体内容
     if(diaryList != 0){//有请求到数据的时候
       for(var i=0 ; i<diaryLength ; i++){
          diaryContent[i] = [];
          var nowTime = diaryTimeObj[i].fulldate;
          for(var j=0 ; j<diaryList.length ; j++){
            if(diaryList[j].ctime.slice(0,8) == nowTime){
              diaryContent[i].push(diaryList[j]);
            }
          }
       }
    }
     return diaryContent;
  }

  //创建单元格填充内容
  function innerTdContent(diaryObj,diaryContent){
    var diaryTime = diaryObj.diaryTime;//完整的日期 年月日星期
    var diaryLength = diaryObj.diaryLength;//日历中的天数
    var tdContent = [];//单元格填充的内容数组
    for(var i=0 ; i<diaryLength ; i++ ){
      var tdHtml = '';
      var fulldate = diaryTime[i].fulldate;//20131115
      var weekDay = diaryTime[i].weekDay;//星期几
      var dateOnly = diaryTime[i].dateOnly;//几号
      tdHtml+='<td date="'+ fulldate + '"weekday=' + weekDay + '><div class="td-inner"><div class="date-num">' + dateOnly +'<a href="###" class="add-note"><s class="add-icon"></s>添加记事</a></div>';
      if(diaryContent.length != 0){//有请求道数据的时候填充数据否则只填充td
        if(diaryContent[i].length != 0){//有内容
          tdHtml+='<ul>';
          for(var k=0 ; k<diaryContent[i].length;k++){
            if(diaryContent[i][k].flag == 1){
              tdHtml+='<li pid="' + diaryContent[i][k].pid + '" subcontent="'+diaryContent[i][k].subcontent+'" flag="'+diaryContent[i][k].flag+'" clockDate="'+diaryContent[i][k].clockDate+'"><p class="tip-js"><a href="###" class="lineb">' + mCutStr(diaryContent[i][k].subtitle,30)+'</a></p></li>';
            }else if(diaryContent[i][k].flag == 3){
              tdHtml+='<li pid="'+diaryContent[i][k].pid+'" subcontent="'+diaryContent[i][k].subcontent+'" flag="'+diaryContent[i][k].flag+'" clockDate="'+diaryContent[i][k].clockDate+'"><p class="tip-warning"><s class="clock-icon"></s><a href="###" class="lineb">' + mCutStr(diaryContent[i][k].subtitle,20)+'</a></p></li>';
            }else if(diaryContent[i][k].flag == 2){
              var text = diaryContent[i][k].keys+'等共'+diaryContent[i][k].length+'条信息';
              tdHtml+='<li flag="'+diaryContent[i][k].flag+'"><p class="tip-zx"><a href="http://blog.10jqka.com.cn/diary/ck-subscribe.html">' + text +'</a></p></li>';
            }
          }//for
          tdHtml+='</ul>';
          }//if有数组
        }
        tdHtml+='</div></td>';
        tdContent.push(tdHtml);
      }//for
    return tdContent;
  }

  //创建日历
  function createDiary(currentYear,currentMonth,diaryList){
      var diaryObj = sortDiary(currentYear,currentMonth);
      var diaryContent = sortDiaryContent(currentYear,currentMonth,diaryList);
      var tdContent = innerTdContent(diaryObj,diaryContent);
      var diaryLength = diaryObj.diaryLength;
      var arrDate = diaryObj.diaryTime;
      var lastDays = diaryObj.lastDays;
      var countNowDays = diaryObj.countNowDays;
      noteBody.html('');
      var weekLength = diaryLength/7;//日历里面包括几个星期
      var noteTable = '<table>';
      var l = 0;//用于数组的遍历
      for(var i=0 ; i<weekLength ; i++){
        noteTable += '<tr>';
        for(var n=0; n<7 ;n++){
            noteTable += tdContent[l];
            l++;
          }
          noteTable += '</tr>';
      }
      noteTable += '</table>';
      noteBody.html(noteTable);
      $("#noteBody td").slice(0,lastDays).addClass('other-month');//上个月添加特殊的样式
      $("#noteBody td").slice(lastDays+countNowDays).addClass('other-month');//下个月添加特殊的样式
      $("#noteBody tr").each(function(){
        $(this).find("td").eq(0).addClass('bg-date');
        $(this).find("td").eq(6).addClass('bg-date');
      })
  }

//处理请求到的数据
function treatData(js,dy){
  var diaryList = [];//用于存储所有要填进去列表的数据，包括订阅和记事；
  if($(js)[0].errorCode == 0){
      var jsArr = $(js)[0].data;
      for(var i=0 ; i<jsArr.length ; i++){
        var ctime = getFullDate(jsArr[i].ctime*1000);
        var clockDate;
        var clock = jsArr[i].clock;
        var subtitle = jsArr[i].subtitle;
        var subcontent = jsArr[i].content;
        var pid = jsArr[i].pid;
        var codename = jsArr[i].codename;
        var clockDate;//提醒时间
        if(clock == 0){//没有闹钟提醒的时候
          clockDate = 0;
          diaryList.push({flag:1,ctime:ctime,clockDate:clockDate,subtitle:subtitle,subcontent:subcontent,pid:pid,codename:codename}); 
        }else{
          clockDate = getFullDate(clock*1000);
          diaryList.push({flag:3,ctime:ctime,clockDate:clockDate,subtitle:subtitle,subcontent:subcontent,pid:pid,codename:codename}); 
        }
      }
    }
  if($(dy)[0].status == 0 && $(dy)[0].data.length != 0){
    var dyArr = $(dy)[0].data;
    var dyKeys = [];//用于存储订阅的关键字
    var dytime = getFullDate(dyArr[0].ctime*1000).slice(0,8)+'0000';//当日的时间 
    var dylength = dyArr.length;
    for(var i=0 ; i<dyArr.length ; i++){
        var codename = dyArr[i].codename;
        for(var k=0 ; k<codename.length ; k++){
          dyKeys.push(codename[k]);
        }
    }
    dyKeys = getTop(dyKeys,2).join(',');
    diaryList.push({flag:2,ctime:dytime,keys:dyKeys,length:dylength});
  }
  dateSort(diaryList);
  return diaryList;
}

//页面渲染函数
function render(nowYear,nowMonth){

  //没有数据的时候或者有任何请求出错的时候先出现日历
  var diaryList = [];
  createDiary(nowYear,nowMonth,diaryList); 
  //页面刚进入的时候渲染
  if(IS == true){
    IS = false;
    setSelectYear(nowYear);
    setSelectMonth(nowMonth);
    $.getJSON(jsUrl,{order: 'display_date desc'},function(js){   
      $.getJSON(dyUrl,function(dy){
        //初始化列表
        var diaryList = treatData(js,dy);
        createDiary(nowYear,nowMonth,diaryList); 
        IS = true;
      });
    });
  }
}

  //页面初始化
  setSelectYear(getDomainTime().nowYear);
  setSelectMonth(getDomainTime().nowMonth);
  var IS = true;
  render(getDomainTime().nowYear,getDomainTime().nowMonth);


  //点击事件列表的切换
  $("#date-pre").live('click',function(){     
      if (IS == false) {
        return;
      }else{
        var currentMonth = parseInt(monthBt.attr('month'));
        var currentYear = parseInt(yearBt.attr('year'));
        var dateObj = countLastDate(currentYear,currentMonth);
        render(dateObj.year,dateObj.month);
      }      
  });

  $("#date-next").live('click',function(){
    if(IS == false){
      return;
    }else{
      var currentMonth = parseInt(monthBt.attr('month'));
      var currentYear = parseInt(yearBt.attr('year'));
      var dateObj = countNextDate(currentYear,currentMonth);
      render(dateObj.year,dateObj.month);
    }      
  });

  $("#year-bt").live('click', function () {
      var currentYear = parseInt($(this).attr('year'));
      genSelectYear(currentYear);
      yearSelect.show();
  });

  $("#month-bt").live('click', function () {
      var currentMonth = parseInt($(this).attr('month'));
      genSelectMonth(currentMonth);
      monthSelect.show();
  });

  $("#month-select ul li").live('click', function () {
      var currentYear = parseInt(yearBt.attr('year'));
      var currentMonth = parseInt($(this).attr('month'));
      genSelectMonth(currentMonth);
      monthSelect.hide();
      if(IS == false){
        return;
      }else{
        render(currentYear,currentMonth);
      }
  });

  $("#year-select ul li").live('click', function () {
      var currentYear = parseInt($(this).attr('year'));
      var currentMonth = parseInt(monthBt.attr('month'));
      genSelectYear(currentYear);
      yearSelect.hide();
      if(IS == false){
        return;
      }else{
        render(currentYear,currentMonth);
      }
  });

  $("#todayBt").live('click',function(){
      var nowMonth = getDomainTime().nowMonth;
      var nowYear = getDomainTime().nowYear;
      if(IS == false){
        return;
      }else{
      render(nowYear,nowMonth);
      }
  });

  //查看记事
  $(".td-inner ul li").live('click',function(){
    if($(this).attr('flag')==1 || $(this).attr('flag')==3){
      $("#mask_iframe,#show_box").show();
      var pid = $(this).attr('pid');
      showNewsAjax(pid);
    }
  });


//修改记事
  $("#editBtn").live('click',function(){
    $("#edit_box,#mask_iframe").show();
    $("#show_box").hide();
    var pid = $('#pidVal').val();
    var currentUrl = 'http://sapi.10jqka.com.cn/index.php?module=blog&controller=api&action=getStockDiaryDetail&userid='+userid+'&pid='+pid+'&type=jsonp&charset=utf8&callback=?';
     $.getJSON(currentUrl,function(data){
      editNews(data,currentUrl);
    });
  });

  //详情修改
  $("#xqEdit").live('click',function(){
    $("#edit_box,#mask_iframe").show();
    var pid = $('#xqPid').val();
    var currentUrl = 'http://sapi.10jqka.com.cn/index.php?module=blog&controller=api&action=getStockDiaryDetail&userid='+userid+'&pid='+pid+'&type=jsonp&charset=utf8&callback=?';
     $.getJSON(currentUrl,function(data){
      editNews(data,currentUrl);
    });
  });

  //编辑后保存保存
  $("#edit_saveBtn").click(function(){
     var editdata = editData($(this));
     if( editdata['title'] == '' ){
      promptFun('请输入标题');
      $(this).parents(".note-pop").find('.subtitle_edit').focus();
      return false;
    }
    if( editor.hasContents() == false ){
      promptFun('内容不能为空');
      $(this).parents(".note-pop").find('.news_content_edit').focus();
      return false;
    }
    $("#edit_box,#mask_iframe").hide();
     $.ajax({
          url: urlMap.save,
          data: editdata,             
          type: 'POST',               
          dataType: 'json',
          success: function(data){
              var errcode = data.errorCode,
                  errmsg = data.errorMsg
              if (errcode == 0) {
                  tipBox('修改成功！');
                  render(getYear(),getMonth());
              } else {
                  alert(errmsg);
                  tipBox("修改失败！");
              }
          },
          error: function(x, status) {
              alert('error' + ' :' + status);
              tipBox("修改失败！");
          }
      });
  });

  //通过单元格去添加记事
  $('.add-note').live('click',function(){
    $("#add_box,#mask_iframe").show();
    var date = $(this).parents('td').attr('date');
    var display_date = setDispaly_date(date);
    $("#add_box .wdate_picker_date").val(display_date);
  });//添加记事
  
  //保存添加记事
  $("#add_saveBtn").click(function(){
    var adddata = addData($(this));
    if( adddata['title'] == '' ){
      promptFun('请输入标题');
      $(this).parents(".note-pop").find('.subtitle_edit').focus();
      return false;
    }
    if( editor2.hasContents() == false ){
      promptFun('内容不能为空');
      $(this).parents(".note-pop").find('.news_content_edit').focus();
      return false;
    }
    $("#add_box,#mask_iframe").hide();
    $.ajax({
        url: urlMap.save,
        data: adddata,             
        type: 'POST',               
        dataType: 'json',
        success: function(data){
            var errcode = data.errorCode,
                errmsg = data.errorMsg
            if (errcode == 0) {
                tipBox('添加记事成功！');
                render(getYear(),getMonth());
            } else {
                alert(errmsg);
                tipBox("添加记事失败！")
            }
        },
        error: function(x, status) {
            alert('error' + ' :' + status);
            tipBox("添加记事失败！");
        }
    });
  });

//删除函数
  function deleteIf(pid){
    $("#delete_box,#mask_iframe").show();
    var deleteIf1 ;
    var deleteUrl = 'http://sapi.10jqka.com.cn/index.php?module=blog&controller=api&action=deletepost&userid=' + userid + '&&pid=' + pid + '&type=jsonp&callback=?';
    $("#deleteYes").click(function(){
        $("#delete_box,#mask_iframe,#show_box").hide();
        $.getJSON(deleteUrl, function(deletemes) {
            if (deletemes.errorCode == 0) {
                tipBox('删除记事成功');
                render(getYear(),getMonth());
            }else{
              tipBox('删除记事失败');
            }
        });
    });
    $("#deleteNo").click(function(){
        $("#delete_box,#mask_iframe,#show_box").hide();
    });
  }
  //删除记事
  $("#deleteBtn").click(function(){
    var pid = $(this).parents(".note-pop").find("#pidVal").val();
    deleteIf(pid);
  });

  //详情删除
  $("#xqDelete").click(function(){
    var pid = $("#xqPid").val();
    deleteIf(pid);
  });


  $('#noteBody').delegate('li', 'mouseenter', function(e) {
    if($(this).attr('flag') == 1 || $(this).attr('flag') == 3){
      var tipContent = $(this).attr('subcontent');
      var tipClockTime = $(this).attr('clockDate');
      var tipPid = $(this).attr('pid');
      var tipClockText = '提醒时间：';
      if(tipClockTime == 0){
          tipClockText+='无';
      }else{
          var tipYear = tipClockTime.slice(0,4);
          var tipMonth = tipClockTime.slice(4,6);
          var tipDate = tipClockTime.slice(6,8);
          var tipHour = tipClockTime.slice(8,10);
          var tipMin = tipClockTime.slice(10,12);
          var tipSec = tipClockTime.slice(12);
          tipClockText+=tipYear+'-'+tipMonth+'-'+tipDate+' '+tipHour+':'+tipMin+':'+tipSec;
      }
        showTip($(this), tipContent , tipClockText , tipPid);
    }
  })

  $('#noteBody').delegate('li', 'mouseleave', function(e) {
      if (! $('.xq-box')[0].contains(e.relatedTarget)) {
          $('.xq-box').hide();
      };
  })

  $('.xq-box').bind('mouseleave', function() {
      $(this).hide();
  })


  function showTip(el, content,tipClockText, pid, remind ) {
      var left = $(el).position().left;
      var top  = $(el).position().top;
      var parentWidth = $('#noteBody').width();
      var elWidth = $(el).width();
      var targetLeft;
      if (left > parentWidth / 2) {
          targetLeft = left - $('.xq-box').outerWidth();
          $('.xq-box').find('.point').css({
              left: $('.xq-box').outerWidth() - 2,
              background: 'url(images/point-r.png)'
          })
      } else {
          targetLeft = left + elWidth;
          $('.xq-box').find('.point').css({
              left: -9,
              background: 'url(http://i.thsi.cn/images/blog/diary/point.png)'
          })
      }
      var targetHeight = $('.xq-box').find('p').eq(0).html(content).end().end().height(); 
      $(".xq-time").text(tipClockText);
      $("#xqPid").val(pid);
      $('.xq-box').css({
          left: targetLeft,
          top : top - targetHeight / 2 + $(el).height() / 2
      }).show();
  }

})