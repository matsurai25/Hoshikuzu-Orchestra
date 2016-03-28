// Generated by CoffeeScript 1.10.0

/*
 */
var MIDI, activeItem, applyTargetOption, applyToComp, checkCanExcute, convertBin2Byte, getMidiFile, go, mainloop, print_time;

applyTargetOption = function(target, note, CompObj) {

  /*
  ここで位置などの値を適応しています
  note.intime   :  開始時間
  note.pitch    :  音の高さ。値は0～126
  note.velocity :  音の強さ。値は0～126
   */
  target.name = "Note_" + note.pitch;
  target("position").setValue([CompObj.width / 2 + (note.pitch - 64) * 50, CompObj.height / 2 + (note.velocity - 64) * -7]);
  target("scale").setValue([note.velocity * 1.3, note.velocity * 1.3]);
};

MIDI = {
  file: null,
  length: null,
  chunktype: null,
  bytes: [],
  tracksize: null,
  tracks: [],
  timeunit: null,
  tempo: "",
  tmp: {
    cur_deltatime: 0,
    last_note_code: ""
  }
};

activeItem = app.project.activeItem;

convertBin2Byte = function(offset) {
  var c;
  if (MIDI.file == null) {
    $.writeln("MIDI.fileがないのにconvertBin2Byte");
    return false;
  }
  c = MIDI.file.charCodeAt(offset).toString(16).toUpperCase();
  if (c < 10) {
    c = 0 + String(c);
  }
  return String(c);
};

getMidiFile = function() {
  var i, j, myFile, n, ref;
  this.FilePath = File.openDialog("MIDIファイルを選択してください", "*.mid");
  myFile = new File(this.FilePath);
  $.writeln(myFile.fsName);
  myFile.encoding = "BINARY";
  $.writeln(myFile.encoding);
  if (!myFile.open("r")) {
    alert("ファイルがオープンできませんでした");
    return false;
  }
  MIDI.length = myFile.length;
  MIDI.file = myFile.read(MIDI.length);
  myFile.close();
  MIDI.bytes = [];
  for (i = j = 0, ref = MIDI.length; 0 <= ref ? j < ref : j > ref; i = 0 <= ref ? ++j : --j) {
    n = convertBin2Byte(i);
    MIDI.bytes.push(n);
  }
  if (MIDI.bytes == null) {
    alert("データ取得不可");
    return false;
  }
  MIDI.chunktype = MIDI.bytes[0] + MIDI.bytes[1] + MIDI.bytes[2] + MIDI.bytes[3];
  MIDI.tracksize = parseInt(MIDI.bytes[10], 16) + parseInt(MIDI.bytes[11], 16);
  MIDI.timeunit = MIDI.bytes[12] + MIDI.bytes[13];
  $.writeln("■■■■■");
  $.writeln("MIDI.length : " + MIDI.length);
  $.writeln("MIDI.chunktype : " + MIDI.chunktype);
  $.writeln("MIDI.tracksize : " + MIDI.tracksize);
  $.writeln("MIDI.timeunit : " + MIDI.timeunit);
  $.writeln("■■■■■");
  if (MIDI.chunktype === "4D546864") {
    return mainloop();
  }
};

mainloop = function() {
  var b, bit, cur_deltatime, deltatime_bit, deltatimes, dt, i, j, k, l, len, m, note, o, p, read_byte, ref, ref1, ref2, ref3, ref4, ref5, space_bit, tmp_bit;
  i = 14;
  while (i < MIDI.length) {
    if (MIDI.bytes[i] + MIDI.bytes[i + 1] + MIDI.bytes[i + 2] + MIDI.bytes[i + 3] === "4D54726B") {
      $.writeln("トラックの開始");
      MIDI.tracks[MIDI.tracks.length] = {
        name: "",
        size: parseInt(MIDI.bytes[i + 4] + MIDI.bytes[i + 5] + MIDI.bytes[i + 6] + MIDI.bytes[i + 7], 16),
        notes: []
      };
      MIDI.tmp.cur_deltatime = 0;
      MIDI.tmp.last_note_code = "";
      i += 8;
      continue;
    }
    b = 0;
    deltatimes = [];
    while (b < MIDI.tracks[MIDI.tracks.length - 1].size) {
      deltatimes.push(MIDI.bytes[i + b]);
      if (parseInt(MIDI.bytes[i + b], 16) < parseInt("80", 16)) {
        break;
      }
      b++;
    }
    i += b + 1;
    deltatime_bit = "";
    for (j = 0, len = deltatimes.length; j < len; j++) {
      dt = deltatimes[j];
      tmp_bit = parseInt(dt, 16).toString(2);
      space_bit = "";
      for (bit = m = 0, ref = 8 - tmp_bit.length; 0 <= ref ? m <= ref : m >= ref; bit = 0 <= ref ? ++m : --m) {
        space_bit += "0";
      }
      deltatime_bit = deltatime_bit + String(space_bit + tmp_bit).substr(-7);
    }
    cur_deltatime = parseInt(deltatime_bit, 2);
    MIDI.tmp.cur_deltatime = MIDI.tmp.cur_deltatime + cur_deltatime;
    read_byte = 0;
    if (MIDI.bytes[i] === "FF") {
      l = parseInt(MIDI.bytes[i + 2], 16);
      if (MIDI.bytes[i + 1] === "03") {
        for (k = o = ref1 = i + 3, ref2 = i + 3 + l; ref1 <= ref2 ? o < ref2 : o > ref2; k = ref1 <= ref2 ? ++o : --o) {
          MIDI.tracks[MIDI.tracks.length - 1].name += "%" + MIDI.bytes[k];
        }
        MIDI.tracks[MIDI.tracks.length - 1].name = decodeURI(MIDI.tracks[MIDI.tracks.length - 1].name);
        $.writeln("トラック名:" + MIDI.tracks[MIDI.tracks.length - 1].name);
        $.writeln("トラックサイズ:" + MIDI.tracks[MIDI.tracks.length - 1].size);
      } else if (MIDI.bytes[i + 1] === "51") {
        for (k = p = ref3 = i + 3, ref4 = i + 3 + l; ref3 <= ref4 ? p < ref4 : p > ref4; k = ref3 <= ref4 ? ++p : --p) {
          MIDI.tempo += MIDI.bytes[k];
        }
        MIDI.tempo = parseInt(MIDI.tempo, 16);
        $.writeln("テンポ:" + MIDI.tracks[MIDI.tracks.length - 1].tempo);
      } else if (MIDI.bytes[i + 1] === "58") {
        $.writeln("拍子情報を発見");
      } else if (MIDI.bytes[i + 1] === "59") {
        $.writeln("キー情報を発見");
      } else if (MIDI.bytes[i + 1] === "2F") {
        $.writeln("トラックの終了:" + MIDI.tracks[MIDI.tracks.length - 1].name);
      } else {
        $.writeln("それ以外のイベント" + MIDI.bytes[i + 1] + "を発見");
      }
      read_byte += 2 + l;
    } else if (MIDI.bytes[i] === ("9" + (MIDI.tracks.length - 2))) {
      $.write(".");
      note = {
        intime: MIDI.tmp.cur_deltatime,
        pitch: parseInt(MIDI.bytes[i + 1], 16),
        velocity: parseInt(MIDI.bytes[i + 2], 16)
      };
      MIDI.tracks[MIDI.tracks.length - 1].notes.push(note);
      MIDI.tmp.last_note_code = "9" + (MIDI.tracks.length - 2);
      read_byte += 2;
    } else if (MIDI.bytes[i] === ("8" + (MIDI.tracks.length - 2))) {
      MIDI.tmp.last_note_code = "8" + (MIDI.tracks.length - 2);
      read_byte += 2;
    } else if ((parseInt("A0", 16) <= (ref5 = parseInt(MIDI.bytes[i], 16)) && ref5 <= parseInt("EF", 16))) {
      $.writeln("コントロールイベントを発見");
      read_byte += 2;
    } else {
      if (MIDI.tmp.last_note_code === ("9" + (MIDI.tracks.length - 2))) {
        $.write(".");
        note = {
          intime: MIDI.tmp.cur_deltatime,
          pitch: parseInt(MIDI.bytes[i], 16),
          velocity: parseInt(MIDI.bytes[i + 1], 16)
        };
        MIDI.tracks[MIDI.tracks.length - 1].notes.push(note);
        MIDI.tmp.last_note_code = "9" + (MIDI.tracks.length - 2);
        read_byte += 1;
      } else if (MIDI.tmp.last_note_code === ("8" + (MIDI.tracks.length - 2))) {
        MIDI.tmp.last_note_code = "8" + (MIDI.tracks.length - 2);
        read_byte += 1;
      }
    }
    i += read_byte + 1;
  }
  applyToComp();
  return true;
};

applyToComp = function() {
  var CompObj, ex_time, j, len, note, noteNum, ref, results, target, track;
  ex_time = print_time();
  noteNum = 0;
  CompObj = app.project.items.addComp(("MIDI " + ex_time + " ") + noteNum + "~", 1920, 1080, 1.0, 10 * 60, 29.97);
  ref = MIDI.tracks;
  results = [];
  for (j = 0, len = ref.length; j < len; j++) {
    track = ref[j];
    results.push((function() {
      var len1, m, ref1, results1;
      ref1 = track.notes;
      results1 = [];
      for (m = 0, len1 = ref1.length; m < len1; m++) {
        note = ref1[m];
        if (noteNum % 400 === 399) {
          CompObj = app.project.items.addComp(("MIDI " + ex_time + " ") + noteNum + "~", 1920, 1080, 1.00, 600, 29.97);
        }
        target = CompObj.layers.add(app.project.activeItem);
        target.startTime = note.intime / parseInt(MIDI.timeunit, 16) * MIDI.tempo * 0.000001;
        applyTargetOption(target, note, CompObj);
        results1.push(noteNum++);
      }
      return results1;
    })());
  }
  return results;
};

print_time = function() {
  var date, hour, minute, second;
  date = new Date();
  hour = date.getHours();
  minute = date.getMinutes();
  second = date.getSeconds();
  return hour + ":" + minute + ":" + second;
};

checkCanExcute = function() {
  if ((activeItem === null) || !(activeItem instanceof CompItem)) {
    alert("複製配置したいコンポジションを選択した状態で実行して下さい");
    return false;
  }
  if (confirm("現在選択されているコンポジションを複製配置します。")) {
    return true;
  }
  return false;
};

go = function() {
  if (!checkCanExcute()) {
    return;
  }
  return getMidiFile();
};

go();
