/*!-======[ Module Imports ]======-!*/
const fs = "fs".import()
const { generateWAMessageFromContent } = "baileys".import()

/*!-======[ Functions Imports ]======-!*/
const { TelegraPh } = await (fol[0] + 'telegraph.js').r()
const { musixSearch } = await (fol[2] + 'musixsearch.js').r()
const { transcribe } = await (fol[2] + 'transcribe.js').r()
const { tmpFiles } = await (fol[0] + 'tmpfiles.js').r()
const { EncryptJs } = await (fol[2] + 'encrypt.js').r()

/*!-======[ Default Export Function ]======-!*/
export default async function on({ cht, Exp, store, ev, is }) {
    let { sender, id } = cht
    ev.on({ 
        cmd: ['remini'], 
        listmenu: ['remini'],
        tag: "tools",
        energy: 30,
        media: { 
           type: ["image"],
           msg: "Mana fotonya?",
           save: true
        }
    }, async({ media }) => {
       const _key = keys[sender]
         await cht.edit("Bntr...", _key)
       let tph = await TelegraPh(media)
         await cht.edit('Processing...', _key)
       let res = (await fetch(api.xterm.url + "/api/tools/remini?url=" + tph + "&key=" + api.xterm.key).then(a => a.json())).data
         await Exp.sendMessage(id, { image: { url: res.url }, caption: `Response Time: ${res.run_Time}`}, { quoted: cht })
         cht.edit("Nih", _key)
    })
     
    ev.on({ 
        cmd: ['tph','telegraph'],
        listmenu: ['telegraph'],
        tag: 'tools',
        energy: 5,
        media: { 
           type: ["image"],
           msg: "Mana gambarnya?",
           save: false
        }
    }, async({ media }) => {
        let tph = await TelegraPh(media)
            await cht.edit(tph, keys[sender])
	})
	ev.on({ 
        cmd: ['tourl','tmpfile','tmpfiles'],
        listmenu: ['tourl'],
        tag: 'tools',
        energy: 5,
        media: { 
           type: ["image","sticker","audio","video"],
           save: false
        }
    }, async({ media }) => {
        let tmp = await tmpFiles(media)
            await cht.edit(tmp, keys[sender])
	})

	ev.on({ 
        cmd: ['img2prompt','tomprompt','imgtoprompt','imagetoprompt','image2prompt'],
        listmenu: ['img2prompt'],
        tag: 'tools',
        energy: 28,
        media: { 
           type: ["image"],
           msg: "Mana gambarnya?",
           save: true
        }
    }, async({ media }) => {
        await cht.edit("Bntr...", keys[sender])
        let tph = await TelegraPh(media)
            await fs.unlinkSync(media)
        let dsc = await fetch(`${api.xterm.url}/api/img2txt/instant-describe?url=${tph}&key=${api.xterm.key}`)
        .then(response => response.json())
        cht.reply(dsc.prompt)
	})
	ev.on({ 
        cmd: ['enhance','upscale'],
        listmenu: ['enhance', 'enhance list'],
        tag: 'tools',
        energy: 35,
        media: { 
           type: ["image"],
           msg: "Mana fotonya?",
           save: true
        }
    }, async({ media }) => {
        const _key = keys[sender]
        let type = cht.q ? cht.q : "text"
        if(cht.q == "list") return cht.reply(infos.enhance)
        if(cht.q && !(["phox2","phox4","anix2","anix4","stdx2","stdx4","cf","text"].includes(cht.q))) return cht.reply("Type tidak ada! mungkin salah ketik!\n\n" +infos.enhance)
        await cht.edit("Uploading image...", _key)
        let imgurl = await TelegraPh(media)
        await fs.unlinkSync(media)
        let ai = await fetch(`${api.xterm.url}/api/tools/enhance/createTask?url=${imgurl}&type=${type}&key=${api.xterm.key}`)
        .then(response => response.json())

        if (!ai.status) return cht.reply(ai.cht)
        while (true) {
          try{
            let s = await fetch(`${api.xterm.url}/api/tools/enhance/taskStatus?id=${ai.id}`)
            .then(response => response.json())
            await cht.edit(`Status: ${s?.status}\nProgress: ${s?.progress}%`, _key)
            if (s.task_status == "failed") {
                return cht.reply(s.task_status)
            }
            if (s.task_status == "done") {
                await Exp.sendMessage(id, { image: { url: s.output }, caption: `Duration: ${(await "ms".r()).default(s.duration)}\nSize: ${s.img_out_h}x${s.img_out_w}\nSize: ${(s.filesize+"").toFormat()}` }, { quoted: cht })
                break
            }
          await new Promise(resolve => setTimeout(resolve, 3000))
          } catch (e) {
             await cht.reply("TypeErr:"+e.message)
             break
          }
        }
	})
	
	ev.on({ 
        cmd: ['ss','ssweb'],
        listmenu: ['ssweb'],
        tag: 'tools',
        energy: 7.5
    }, async() => {
        let q = is.quoted?.url || is.url 
        if(!q) return cht.reply("Mana linknya?")
        Exp.sendMessage(id, { image: { url : 'https://image.thum.io/get/width/1900/crop/1000/fullpage/' + q[0] }, caption: `Result✔️`}, { quoted: cht } )
	})
	
	ev.on({ 
        cmd: ['musixsearch','searchmusic','whatmusic','searchsong','musicrecognition'],
        listmenu: ['whatmusic'],
        tag: 'tools',
	    energy: 10,
        media: { 
           type: "audio",
           msg: "Mana audionya?"
        }
    }, async({ media }) => {
         await cht.edit("Bntar tak dengerin dulu...", keys[sender])
         musixSearch(media)
         .then(a => cht.reply(a))
	})
	
	ev.on({ 
        cmd: ['audio2text','audio2txt','transcribe'],
        listmenu: ['transcribe'],
        tag: 'tools',
	    energy: 25,
        media: { 
           type: "audio",
           msg: "Mana audionya?"
        }
    }, async({ media }) => {
         transcribe(media)
         .then(a => cht.reply(a.text))
	})
	
	ev.on({ 
        cmd: ['getchid','getchannelid','getsaluranid','getidsaluran'],
        listmenu: ['getchid'],
        tag: 'tools',
	    energy: 10,
    }, async() => {
      try {
         if(!cht.quoted) return cht.reply("Reply pesan yang diteruskan dari saluran!")
         let res = (await store.loadMessage(id, cht.quoted.stanzaId)).message.extendedTextMessage.contextInfo.forwardedNewsletterMessageInfo
         if(!res) return cht.reply("Gagal, id saluran mungkin tidak tersedia")
         cht.edit(`[ *📡ID SALURAN/CH* ]`
             + `\nID Saluran: ${res.newsletterJid}`
             + `\nID Pesan: ${res.serverMessageId}`,
         keys[sender])
       } catch(e) {
           console.log(cht.quoted)
           cht.reply("Error get Channel id" + e.message)
       }
	})
	
	ev.on({ 
        cmd: ['colong','c'],
        listmenu: ['colong'],
        tag: 'tools',
        premium: true
    }, async({ cht }) => {
      try {
         if(!cht.quoted) return
         let res = (await store.loadMessage(id, cht.quoted.stanzaId)).message
         let evaled = `(async()=>{let msg = await generateWAMessageFromContent(cht.sender, ${JSON.stringify(res, null, 2)}, {})`
         + `\n  await Exp.relayMessage(msg.key.remoteJid, msg.message, {`
         + `\n      messageId: msg.key.id`
         + `\n  })`
         + `\n})()`
      
         let random = Math.floor(Math.random() * 10000)
         await eval(`ev.on({ 
             cmd: ['${random}'],
             listmenu: ['${random}'],
             tag: 'other'
         }, async({ cht }) => {
             ${evaled.replace("cht.sender","cht.id")}
         })`)
         await sleep(3000)
         await cht.reply(`Code telah dikirimkan melalui chat pribadi!. Ketik .${random} Untuk melihat hasil`)
         await sleep(3000)
         await Exp.sendMessage(cht.sender, { text: evaled }, { quoted: cht })
       } catch(e) {
           console.log(cht.quoted)
       }
	})
	
	ev.on({ 
        cmd: ['vocalremover','stems'],
        listmenu: ['vocalremover'],
        tag: 'tools',
	    energy: 50,
        media: { 
           type: "audio",
           msg: "Mana audionya?"
        }
    }, async({ media }) => {
         await cht.edit("Tunggu ya, sabar", keys[sender])
         let response = await fetch(`${api.xterm.url}/api/audioProcessing/stems?key=${api.xterm.key}`, {
           method: 'POST',
             headers: {
                 'Content-Type': 'application/octet-stream'
             },
             body: media
         })
         let a = (await response.json()).data
         await Exp.sendMessage(id, { audio: { url: a[0].link }, mimetype: "audio/mpeg" }, { quoted: cht })
         await Exp.sendMessage(id, { audio: { url: a[1].link }, mimetype: "audio/mpeg" }, { quoted: cht })
	})
	
	ev.on({ 
        cmd: ['toimage','toimg'],
        listmenu: ['toimg'],
        tag: 'tools',
	    energy: 4,
        media: { 
           type: "sticker",
           save: false
        }
    }, async({ media }) => {
         Exp.sendMessage(id, { image: media }, { quoted: cht })
	})
	
	ev.on({ 
        cmd: ['enc','encryptjs','encrypt'],
        listmenu: ['encryptjs'],
        tag: 'tools',
        args: "Mana code js nya?",
        energy: 2
    }, async() => {
        let res = await EncryptJs(cht.q)
        Exp.sendMessage(cht.id, { document: Buffer.from(res.data), mimetype:"application/javascript", fileName:"encrypt.js" }, { quoted:cht })
	})
	
}
