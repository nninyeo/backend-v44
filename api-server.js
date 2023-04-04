const express = require('express')
const app = express()
const port = 3000
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const jwt = require('jsonwebtoken')

app.use(cookieParser());
app.use(bodyParser.json());

const jwtKey = "aaasd3234234";

const members = [
  {
    id: 3,
    name: "도서관",
    loginId: "lib",
    loginPw: "africa"
  },
  {
    id: 4,
    name: "김상철",
    loginId: "a",
    loginPw: "1"
  }
]

app.use(bodyParser.json())

app.get('/', (req, res) => {

  res.send('Hello World!')
})



app.get('/api/account', (req, res) => {
  // console.log(req.cookies)

  // if(req.cookies && req.cookies.account){
  if(req.cookies && req.cookies.token){

    // const member = JSON.parse (req.cookies.account);

    // if(member.id){
    //   return res.send(member);
    // }
    jwt.verify(req.cookies.token, jwtKey, (err, decoded) =>{
      if(err){
        return res.sendStatus(401);
      }
      else{
        res.send(decoded);
      }
    })
    

  }
  else{
    res.sendStatus(401);//No 권한
  }
})

app.post('/api/account', (req, res) => {
  const loginId = req.body.loginId;
  const loginPw = req.body.loginPw;

  const member = members.find(m=> m.loginId === loginId && m.loginPw === loginPw);

  if(member) {
    const options = {
      domain:"localhost",
      path:"/",
      httpOnly: true
    }

    const token = jwt.sign({
      id: member.id,
      name: member.name,
    }, jwtKey, {
      expiresIn: "15m",
      issuer: "africalib"
    });

    res.cookie("token", token, options);
    // res.cookie("account", JSON.stringify(member), options);
    res.send(member);
  }
  else{
    res.sendStatus(404);
  }


  console.log(loginId, loginPw)
})

app.delete('/api/account', (req, res) => {
  if(req.cookies && req.cookies.token){
    res.clearCookie("token");
  }

  res.sendStatus(200);
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})