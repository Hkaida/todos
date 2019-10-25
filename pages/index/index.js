//index.js
//获取应用实例
const app = getApp()

Page({
  data: {
    input: '',
    todoCount: 0,
    selectAll: false,
    todos: [
      // { name: '待办事项1', completed: true },
      // { name: '待办事项2', completed: false },
      // { name: '待办事项3', completed: false },
      // { name: '待办事项4', completed: false },
      // { name: '待办事项5', completed: false }
    ],
  },
  //生命周期函数
  onLoad(){
    //从缓存中取得数据
    wx.getStorage({
      key: 'todos',
      success: (res) => {
        console.log(res);
        this.setData({
          'todos': res.data,
          todoCount: this.getTodoCount()
        })
      },
    })
  },
  //事件类方法
  addHandle(e){
    if(!this.data.input){ return }
    this.data.todos.push({ name: this.data.input, completed: false });
    //写入缓存 
    wx.setStorage({
      key: "todos",
      data: this.data.todos,
      success: () => {
        this.setData({
          todos: this.data.todos,
          input: '',
          todoCount: this.getTodoCount()
        })
      }
    })
  },
  newTodoHandle(e){
    this.setData({
      input: e.detail.value
    })
  },
  toggleHandle(e){
    let i = e.target.dataset.index;
    this.data.todos[i].completed = !this.data.todos[i].completed;
    this.setData({
      todos: this.data.todos,
      todoCount: this.getTodoCount()
    })
  },
  toggleAllHandle(){
    //全选、取消全选
    this.data.todos.forEach(item => {
      item.completed = !this.data.selectAll
    });
    this.setData({
      todos: this.data.todos,
      selectAll: !this.data.selectAll,
      todoCount: this.getTodoCount()
    })
  },
  delHandle(e){
    let i = e.target.dataset.index;
    this.data.todos.splice(i,1);
    wx.setStorage({
      key: "todos",
      data: this.data.todos,
      success: () => {
        this.setData({
          todos: this.data.todos,
          todoCount: this.getTodoCount()
        })
      }
    })
  },
  delAllHandle() {
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
          todoCount: this.getTodoCount()
        })
      }
    })
  },
  //工具类方法
  getTodoCount(){
    let num = this.data.todos.length;
    this.data.todos.forEach(item => {
      if(item.completed == true){
        num--;
      }
    });
    return num
  }
})
