//index.js
//获取应用实例
const app = getApp()
const util = require('../../utils/util.js');
Page({
  data: {
    input: '',
    textarea: '',
    textColor:'',
    todoProgress: 0,
    selectAll: false,
    mask: true,
    todoInfo: true,//事项详情或者编辑页面打开
    todoEdit: true,//事项是否在编辑状态
    todoInsert: true,//插入事项状态
    todoColor: true,//颜色选择
    todos: [
      // { name: '待办事项1', completed: true, remarks: '这是一个特别啰嗦的备注', creationTime: '', lastTime: '', color:'red' },
      // { name: '待办事项2', completed: false, remarks: '这是一个特别啰嗦的备注' },
      // { name: '待办事项3', completed: false, remarks: '这是一个特别啰嗦的备注' },
      // { name: '待办事项4', completed: false, remarks: '这是一个特别啰嗦的备注' },
      // { name: '待办事项5', completed: false, remarks: '这是一个特别啰嗦的备注' }
    ],
    colorList: [
      { name: '黑色', value: 'black' },
      { name: '红色', value: 'red' },
      { name: '橙色', value: 'orange' },
      { name: '黄色', value: 'yellow' },
      { name: '绿色', value: 'green' },
      { name: '青色', value: 'cyan' },
      { name: '蓝色', value: 'blue' },
      { name: '紫色', value: 'purple' }
      ],
    move:{
      disabled: true,
      tapActive: {},//拖动的对象
      moveActive: {},//拖拽排序时，由此判断插入位置提示，非排序状态下，避免事项高亮所以初始化为对象
      sortTipUp: true, //往上拖拽
      sortTipDown: true,
      timer: null,//定时器
      style: 'background-color: rgba(0, 0, 0, 0.1);',
      top: 0,//判断移动距离
      height: 0,//拖动对象的高度,单位px
      position:[]
    }
  },
  //生命周期函数
  onLoad(){
    //从缓存中取得数据
    wx.getStorage({
      key: 'todos',
      success: (res) => {
        console.log(res);
        this.setData({
          'todos': res.data
        });
        this.setData({
          todoProgress: this.getTodoProgress()
        })
      },
    });
  },
  onReady(){
    //获取事项盒子高度
    let query = wx.createSelectorQuery();
    let node = query.select('.item');
    node.fields({
      computedStyle: ['height']
    }, (res) => {
      //this.data.move.height = parseInt(res.height);
      //for (let i = 0; i < this.data.todos.length; i++) {
        //this.data.move.position.push(i * parseInt(res.height));
      //}
      this.setData({
        //'move.position': this.data.move.position,
        'move.height': parseInt(res.height)
      });
    });
    query.exec();
  },
  //排序
  moveStart(e){//长按1秒触发
    
    this.data.move.timer = setTimeout(() => {
      //console.log('son');
      wx.vibrateShort();
      this.setData({
        'move.tapActive': e.target.dataset.index,
        'move.disabled': false
      });

      //console.log(e.target.dataset.index);
      let i = e.target.dataset.index;
      let query = wx.createSelectorQuery();
      let node = query.selectAll('.item');
      node.fields({
        rect: true
      }, (res) => {
        //this.data.move.height = res[i].height;
        this.data.move.top = res[i].top;
        //console.log('高度：' + res[i].height);
        //console.log('初始top：' + res[i].top);
      });

      query.exec();
    }, 1000);
    //长按时间不足不会触发
  },
  moveIng(e){
    if (this.data.move.disabled){
      return false
    }

    let i = e.target.dataset.index;
    let query = wx.createSelectorQuery();
    let node = query.selectAll('.item');
    node.fields({
      rect: true
    }, (res) => {
      let y = res[i].top - this.data.move.top;
      let count = Math.round(y / parseInt(this.data.move.height)) ? Math.round(y / parseInt(this.data.move.height)) : 0;
      let i2 = i + count;
      if (i2 != this.data.move.moveActive) {
        this.setData({
          'move.moveActive': i2
        })
      }
      //console.log('往上还是往下：' + (i > i2))
      if (i > i2) {
        this.setData({
          'move.sortTipUp': false,
          'move.sortTipDown': true,
        })
      } else if (i == i2) {
        this.setData({
          'move.sortTipUp': true,
          'move.sortTipDown': true,
        })
      } else {
        this.setData({
          'move.sortTipDown': false,
          'move.sortTipUp': true,
        })
      }
    })
    query.exec();
  },
  moveEnd(e){
    clearTimeout(this.data.move.timer);
    this.data.move.timer = null;
    if (this.data.move.disabled) {
      return false
    }
    // this.setData({
    //   'move.tapActive': {},
    //   'move.moveActive': {},
    //   'move.sortTipUp': true,
    //   'move.sortTipDown': true,
    //   'move.disabled': true
    // });

    let i = e.target.dataset.index;
    let query = wx.createSelectorQuery();
    let node = query.selectAll('.item');
    node.fields({
      rect: true
    }, (res) => {
      //console.log('结束top：' + res[i].top);
      this.data.move.top = res[i].top - this.data.move.top;
      //console.log('计算结果：' + Math.round(this.data.move.top / parseInt(this.data.move.height)));
      let count = Math.round(this.data.move.top / parseInt(this.data.move.height)) ? Math.round(this.data.move.top / parseInt(this.data.move.height)) : 0;
      
      let i2 = i + count;
      //console.log('插入位置为i2:'+i2);
      // let temp = this.data.todos[i];
      // this.data.todos[i] = this.data.todos[i2];
      // this.data.todos[i2] = temp;
      let temp = this.data.todos.splice(i,1);
      this.data.todos.splice(i2, 0, temp[0]);

      wx.setStorage({
        key: "todos",
        data: this.data.todos,
        success: () => {
          //console.log('更新数据');
          this.setData({
            todos: this.data.todos,
            'move.tapActive': {},
            'move.moveActive': {},
            'move.sortTipUp': true,
            'move.sortTipDown': true,
            'move.disabled': true
          })
        }
      })

    });
    query.exec();
  },
  //事件类方法
  addHandle(e){//添加事项
    if(!this.data.input){ return }
    let i = this.data.todoIndex;
    if(e){
      i = this.data.todos.length
    }
    this.data.todos.splice(i,0,{ 
      name: this.data.input, 
      completed: false, 
      remarks: this.data.textarea, 
      creationTime: util.formatTime(new Date), 
      lastTime: '-' ,
      color: this.data.textColor});
    //写入缓存 
    wx.setStorage({
      key: "todos",
      data: this.data.todos,
      success: () => {
        this.setData({
          todos: this.data.todos,
          input: '',
          textarea: '',
          textColor: '',
          todoProgress: this.getTodoProgress()
        })
      }
    })
  },
  newInputHandle(e){//获取input输入
    this.setData({
      input: e.detail.value
    })
  },
  newTextareaHandle(e){//获取textarea输入
    this.setData({
      textarea: e.detail.value
    })
  },
  toggleHandle(e){//切换事项选择状态
    let i = e.target.dataset.index;
    this.data.todos[i].completed = !this.data.todos[i].completed;
    wx.setStorage({
      key: "todos",
      data: this.data.todos,
      success: () => {
        this.setData({
          todos: this.data.todos,
          input: '',
          todoProgress: this.getTodoProgress()
        })
      }
    })
  },
  toggleAllHandle() {//全选、取消全选
    this.data.todos.forEach(item => {
      item.completed = !this.data.selectAll
    });
    this.setData({
      todos: this.data.todos,
      selectAll: !this.data.selectAll,
      todoProgress: this.getTodoProgress()
    })
  },
  delHandle(i) {//删除某个事项
    //let i = e.target.dataset.index;
    this.data.todos.splice(i,1);
    wx.setStorage({
      key: "todos",
      data: this.data.todos,
      success: () => {
        this.setData({
          todos: this.data.todos,
          todoProgress: this.getTodoProgress()
        })
      }
    })
  },
  delAllHandle() {//删除所有已完成事项
    var todos = this.data.todos;
    for (let i = todos.length-1; i >= 0 ; i--){
      if (todos[i].completed == true) {
        todos.splice(i,1);
      }
    }
    wx.setStorage({
      key: "todos",
      data: this.data.todos,
      success: () => {
        this.setData({
          todos: todos,
          todoProgress: this.getTodoProgress(),
          selectAll: false
        });
      }
    })
  },
  completeHandle(e) {//完成进度100%提示
    if (e.detail.curPercent == 100 && !this.data.selectAll) {
      wx.showToast({
        title: '恭喜您完成了所有事项！',
        icon: 'none',
        duration: 3000
      })
    };
  },
  getTodoContentHandle(i) {//获取对应事项内容
    this.setData({
      todo: this.data.todos[i]
    });
  },
  todoNameHandle(e){//修改事项名称
    this.setData({
      'todo.name': e.detail.value,
    });
  },
  todoRemarksHandle(e) {//修改事项备注
    this.setData({
      'todo.remarks': e.detail.value,
    });
  },
  changeTodoHandle(e){//保存事项的修改
    let i = this.data.todoIndex;
    this.data.todos[i].name = this.data.todo.name;
    this.data.todos[i].remarks = this.data.todo.remarks;
    this.data.todos[i].lastTime = util.formatTime(new Date);

    wx.setStorage({
      key: "todos",
      data: this.data.todos,
      success: () => {
        this.setData({
          todos: this.data.todos
        });

        this.todoInfoSwitchHandle();

        wx.showToast({
          title: '修改成功',
          icon: 'success',
          duration: 1000
        })
      }
    })
  },
  todoInfoSwitchHandle() {//事项详情开关
    
    this.setData({
      todoInfo: !this.data.todoInfo,
      todoEdit: true,
      mask: !this.data.mask
    });
  },
  todoEditSwitchHandle() {//事项编辑开关
    
    this.setData({
      todoEdit: false
    })
  },
  todoInsertSwitchHandle() {//插入事项开关
    
    this.setData({
      todoInsert: !this.data.todoInsert,
      mask: !this.data.mask
    });
    if (this.data.todoInsert){
      this.addHandle();
    }
  },
  todoColorSwitchHandle() {//颜色选择开关
    this.setData({
      todoColor: !this.data.todoColor,
      mask: !this.data.mask
    })
  },
  changeColorHandle(e) {//修改颜色
    
    let i = this.data.todoIndex;

    this.data.todos[i].color = e.target.dataset.color;
    this.data.todos[i].lastTime = util.formatTime(new Date);

    wx.setStorage({
      key: "todos",
      data: this.data.todos,
      success: () => {
        this.setData({
          todos: this.data.todos
        });

        this.todoColorSwitchHandle();

        wx.showToast({
          title: '修改成功',
          icon: 'success',
          duration: 1000
        })
      }
    })
  },
  maskTapHandle(){
    this.setData({
      todoInfo: true,
      todoEdit: true,
      todoInsert: true,
      todoColor: true,
      mask: true
    })
  },
  menuHandle(e){//打开菜单
    let _this = this;
    this.data.todoIndex = e.target.dataset.index;
    wx.showActionSheet({
      itemList: ['事项详情', '编辑事项', '插入事项', '删除事项', '字体颜色'],
      success (res) {
        console.log(res.tapIndex);
        if ( res.tapIndex == 0 ) {
          //事项详情
          _this.getTodoContentHandle(e.target.dataset.index);
          _this.todoInfoSwitchHandle();
        } else if ( res.tapIndex == 1 ) {
          //编辑事项
          _this.getTodoContentHandle(e.target.dataset.index);
          _this.todoInfoSwitchHandle();
          _this.todoEditSwitchHandle();
        } else if ( res.tapIndex == 2){
          //插入事项
          _this.todoInsertSwitchHandle();
        } else if ( res.tapIndex == 3 ) {
          //删除事项
          _this.delHandle(e.target.dataset.index)
        } else if (res.tapIndex == 4) {
          //字体颜色
          _this.todoColorSwitchHandle();
        }
      },
      fail(res) {
        console.log(res.errMsg)
      }
    })
  },
  //工具类方法
  getTodoProgress(){//获取进度
    let allNum = this.data.todos.length;
    let num = 0;
    this.data.todos.forEach(item => {
      if(item.completed == true){
        num++;
      }
    });
    return Math.floor( num / allNum * 100)
  },
})
