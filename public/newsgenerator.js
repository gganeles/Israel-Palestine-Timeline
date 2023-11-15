import fs from 'fs'
let thing = []
for (let i=0;i<30;i++) {
    let content = {
        "id":i,
        "date":"date",
        "headline":"headline",
    }
    content['sources'] = []
    for (let j = 0; j<15; j++) {
        content['sources'].push({
            "sourceName":"NYT",
            "summery":`this is news summery number ${j}`,
            "url":"url"
        })
    }
    thing[i] = content
}

fs.writeFile('./data.json',JSON.stringify(thing),  
    { 
    encoding: "utf8", 
    flag: "w", 
    mode: 0o666 
    }
  , (err) =>
    console.log(err)
)

