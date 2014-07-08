//之前中途添加了一个zhaobin的admin权限, 只是在users中添加了, 但是忘记在每次普通用户提交任务时加上
//users["zhaobin"].taskLists.push(uuid);      <--在内存中更新zhaobin的taskLists
//dbLog("users['zhaobin'].taskLists.push("+uuid+");");  <----异步写入文件系统
//忘记了这两条后, 每次读取的zhaobin的task 的id和文件系统的存储的id不一样(本来id就有跳空), 导致不能审核
//
//现在需要逐行读取原来的文件日志, 在每个 dbLog("users['zhoumj'].taskLists.push("+uuid+");");
//下面append一条属于 zhaobin的 dbLog("users['zhaobin'].taskLists.push("+uuid+");");
//
console.time('修改数据日志');
var fs = require('fs');
var lazy = require('lazy');

var stream = fs.createReadStream('dataOp.log');
stream.on('end', function(data){
    console.log('dataOp.log lines: %d', count);
    console.log('total.length: %d', total.length);

    fs.writeFile('modifiedDataOp.log', total.join('\n') + '\n', function(err){
      if(err) throw err;
      console.log('I have extract the dataOp.log and modify to modifiedDataOp.log successfully ~~~');

      console.timeEnd('修改数据日志');
      });
    });

var total = new Array();

var element = undefined,
    count = 0,
    uuid = 0;

lazy(stream)
  .lines
  .forEach(function(line){
      count++;
      element = line.toString().trim();
      total.push(element);
      if(element.indexOf('sers[\'zhoumj\'].taskLists.pus') != -1){
        element = element.replace(/zhoumj/, 'zhaobin');
        total.push(element);
      }
  });
