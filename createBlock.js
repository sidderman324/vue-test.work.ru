'use strict';

// Требует node.js и пакета mkdirp
// Использование:
//   - поместить этот файл в корень проекта
//   - исправить пути
//   - в терминале, будучи в корневой папке проекта, выполнить node createBlock.js [имя блока]

const fs = require('fs');                // будем работать с файловой системой

let blockName = process.argv[2];          // получим имя блока
let defaultExtensions = ['less'];         // расширения по умолчанию

// Если есть имя блока
if(blockName) {

  let dirPath = 'src/less/blocks/';  // полный путь к папке для блоков

  // Обходим массив расширений и создаем файлы, если они еще не созданы
  defaultExtensions.forEach(function(extention){

    let filePath = dirPath + blockName + '.' + extention; // полный путь к создаваемому файлу
    let fileContent = '';                                 // будущий контент файла
    let styleFileImport = '';                             // будущая конструкция импорта файла стилей
    let fileCreateMsg = '';                               // будущее сообщение в консоли при создании файла
    let connectManagerPath = 'src/less/style.less';
    let connectManager = fs.readFileSync(connectManagerPath, 'utf8');
    // Делаем из строк массив, фильтруем массив, оставляя только строки с незакомментированными импортами
    let fileSystem = connectManager.split('\n').filter(function(item) {
      if(/^(\s*)@import/.test(item)) return true;
      else return false;
    });

    // Если это LESS
    if(extention == 'less') {
      styleFileImport = '@import \'./src/less/blocks/' + blockName + '.less\';';
      fileContent = '// Для импорта в диспетчер подключений: ' + styleFileImport + '\n\n\n.' + blockName + ' {\n  \n}\n';
      fileCreateMsg = 'Для импорта стилей: ' + styleFileImport;
    }

    // Создаем файл, если он еще не существует
    if(fileExist(filePath) === false) {
      fs.writeFile(filePath, fileContent, function(err) {
        if(err) {
          return console.log('Файл НЕ создан: ' + err);
        }
        console.log('Файл героически создан: ' + filePath);
        if(fileCreateMsg) {
          console.warn(fileCreateMsg);
        }
        // Создаем регулярку с импортом
        let reg = new RegExp(styleFileImport, '');
        // Создадим флаг отсутствия блока среди импортов
        let impotrtExist = false;
        // Обойдём массив и проверим наличие импорта
        for (var i = 0, j=fileSystem.length; i < j; i++) {
          if(reg.test(fileSystem[i])) {
            impotrtExist = true;
            break;
          }
        }
        // Если флаг наличия импорта по-прежнему опущен, допишем импорт
        if(!impotrtExist) {
          // Открываем файл
          fs.open(connectManagerPath, 'a', function(err, fileHandle) {
            // Если ошибок открытия нет...
            if (!err) {
              // Запишем в конец файла
              fs.write(fileHandle, styleFileImport + '\n', null, 'utf8', function(err, written) {
                if (!err) {
                  console.log('[NTH] В диспетчер подключений записано: ' + styleFileImport);
                } else {
                  console.log('[NTH] ОШИБКА записи в диспетчер подключений: ' + err);
                }
              });
            } else {
              console.log('[NTH] ОШИБКА открытия '+ dirs.source + '/less/style.less: ' + err);
            }
          });
        }
        else {
          console.log('[NTH] Импорт НЕ прописан (он там уже есть)');
        }
      });
    }
    else {
      console.log('Файл НЕ создан: ' + filePath + ' (уже существует)');
    }
  });
}
else {
  console.log('Отмена операции: не указан блок');
}

// Проверка существования файла
function fileExist(path) {
  const fs = require('fs');
  try {
    fs.statSync(path);
  } catch(err) {
    return !(err && err.code === 'ENOENT');
  }
}
