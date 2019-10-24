//index.js
//获取应用实例
const app = getApp()

Page({
  data: {
    input: '',
    todos: [
      { name: '待办事项1', completed: true },
      { name: '待办事项2', completed: false },
      { name: '待办事项3', completed: false },
      { name: '待办事项4', completed: false },
      { name: '待办事项5', completed: false }
    ]
  },
  addHandle(e){
    if(!this.data.input){ return }
    let temp = this.data.todos;
    temp.push({ name: this.data.input, completed: false });
    this.setData({
      todos: temp,
      input: ''
    })
  },
  newTodoHandle(e){
    this.setData({
      input: e.detail.value
    })
  }
})
