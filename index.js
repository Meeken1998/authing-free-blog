"use strict"

const Authing = require("authing-js-sdk")
let authing, mainInfo, articles

process.on("unhandledRejection", error => {
  console.log(error)
  return 0
})

const authBlog = () => {
  authing = new Authing({
    userPoolId: "5def3e2a9d0df4ddca6f3f2a",
    secret: "6623a58ebdf87847d37942cc72392c7e"
  })
}

const deleteArticle = async _id => {
  //软删除文章
  let tmparticle = articles
  let arr = []
  for (let i = 0; i < tmparticle.length; i++) {
    if (tmparticle[i]["_id"] != _id && tmparticle[i]["user"] != _id) {
      arr.push(tmparticle[i])
    }
  }
  try {
    let res = await authing.update({
      _id: mainInfo._id,
      oauth: JSON.stringify(arr)
    })

    if (res._id) {
      console.log("删除文章成功")
      return true
      getMainList(true)
    }
  } catch (err) {
    console.log("删除文章失败")
    return false
  }
}

const addArticle = async (title = "", words = "", labels = []) => {
  const currentTime = new Date().valueOf()
  try {
    let res = await authing.register({
      email: currentTime + "@freeblog.cn",
      password: currentTime + "@freeblog.cn",
      oauth: JSON.stringify({
        title,
        words,
        labels
      })
    })

    const articleID = res._id
    const mainID = mainInfo._id

    if (res._id) {
      //文章内容更新成功，把主账号的信息也更新下
      let tmparticles = articles
      tmparticles.push({
        title,
        _id: articleID,
        user: currentTime
      })
      let mainRes = await authing.update({
        _id: mainID,
        oauth: JSON.stringify(tmparticles)
      })
      if (mainRes._id) {
        await getMainList(true)
      }
    }
  } catch (err) {
    console.log("创建文章失败", err)
  }
}

const getArticle = async _id => {
  try {
    let res = await authing.user({
      id: _id
    })

    if (res.oauth) {
      let article = JSON.parse(res.oauth)
      console.log(article)
      return article
    }
  } catch (err) {
    console.log("读取文章内容失败", err)
  }
}

const getMainList = async (isUpdate = false) => {
  try {
    let res = await authing.login({
      email: "78071836@qq.com",
      password: "MEEKENSHD78"
    })
    mainInfo = res
    if (
      mainInfo.oauth &&
      typeof mainInfo.oauth == "string" &&
      mainInfo.oauth.indexOf("[") > -1
    ) {
      articles = JSON.parse(mainInfo.oauth)
    } else {
      articles = []
    }
    console.log(`${isUpdate ? "更新" : "登录"}成功，当前文章列表：`, articles)
    return articles
  } catch (err) {
    console.log("登录失败，获取文章列表失败", err)
  }
}

const start = async () => {
  authBlog()
  await getMainList()
  //   await addArticle("今天是个好日子啊", "测试内容", ["卢本伟牛逼"])
//   await deleteArticle("1575964972956")
//   await getArticle("5def4ffc9d0df431a66fccf0")
}

start()
