const express = require('express')
const app = express()
const port = 3000
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const jwt = require('jsonwebtoken')

app.use(cookieParser());
app.use(bodyParser.json());

const jwtKey = "aaasd3234234";

//데모데이터, 실제는 DB에 있을거임.
const members = [
  {
    idNum: 3,
    name: "도서관",
    loginId: "lib",
    loginPw: "africa"
  },
  {
    idNum: 4,
    name: "김상철",
    loginId: "a",
    loginPw: "1"
  }
]

// app.use(bodyParser.json())

app.get('/', (req, res) => {

  res.send('Hello World!')
})


//그냥 접속들어올때 쿠키유무따져서 401주던 로그인성공시키던 하는거
app.get('/api/account', (req, res) => {
  
  //초기 API테스트용 더미데이터 리턴
  //res.send({ idNum: 3, memberName: "김상철"})

  //접속정보 저장 (초기형): account정보가 있으면 그걸 리턴
  // if(req.cookies && req.cookies.account){
  //    const member = JSON.parse (req.cookies.account);
  //    if(member.idNum)
  //      return res.send(member); 응답을 해줬기때매 로그인 유지됨.(근데보안상취약)

  //접속정보 확인 (토큰방식) 
  if(req.cookies && req.cookies.token){//둘다 있으면

    //검증한번해보고
    jwt.verify(req.cookies.token, jwtKey, (err, decoded) =>{
      if(err){//이상하면 401
        return res.sendStatus(401);
      }
      else{//정상이면 디코드값 던져줌
        res.send(decoded);
      }
    })
  }
  else{//둘다없으면 401
    res.sendStatus(401);//No 권한
  }
})

//로그인시 던진 args받아옴. 바디파서 필요
app.post('/api/account', (req, res) => {
  const loginId = req.body.loginId;
  const loginPw = req.body.loginPw;

  //받아온값에서 멤버정보와 같은게있는지 보는거. 이 문법 눈여겨볼것
  const member = members.find(m=> m.loginId === loginId && m.loginPw === loginPw);

  //그렇게봐서 있으면 send해주는거.
  if(member) {

    //애는 그냥 옵션
    const options = {
      domain:"localhost",
      path:"/",
      httpOnly: true
    }

    //jwt모듈로 토큰 생성함. 생성한거 속에다가 멤버데이터를 넣어서 던져주자. sign()에 3개 들어간다.
    const token = jwt.sign({
      idNum: member.idNum,
      name: member.name,
    }, 
    jwtKey, 
    {
      expiresIn: "15m",
      issuer: "africalib"//임의의 암호화키
    });

    //토큰 생성한거 던져줌
    res.cookie("token", token, options);
    // res.cookie("account", JSON.stringify(member), options);

    //일단 멤버정보 보라고 그냥 리턴해줌. (jwt안쓸때 테스트용)
    res.send(member);
  }
  //그렇게봐서 없으면 404로 리턴처리
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