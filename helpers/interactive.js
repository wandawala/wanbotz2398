const {
	exec
} = await "child".import()
const util = await "util".import()
const _exec = util.promisify(exec)
const fs = "fs".import()
const moment = "timezone".import()
const time = moment.tz('Asia/Jakarta').format('DD/MM HH:mm:ss')
const { transcribe } = await (fol[2] + 'transcribe.js').r()
const { ai } = await "./machine/reasoner.js".r()

export default 
async function In({ cht, Exp, store, is, ev }) {
    try {
        let isPendingCmd = ["y","iy","iya","yakin","hooh","iye","iyh"].some(i => i == (cht?.msg?.toLowerCase() || "" )) ? Data.users[cht.sender.split("@")[0]]?.command : false
            cht.msg = isPendingCmd ? isPendingCmd : cht.msg
        let isMsg = !is?.cmd && !is?.me && !is?.baileys && cht.id !== "status@broadcast"
        let isEval = cht?.msg?.startsWith('>')
        let isEvalSync = cht?.msg?.startsWith('=>')
        let isExec = cht?.msg?.startsWith('$')
        let danger = cht?.msg?.slice(2) ?? ""
        const sanitized = danger.replace(/\s/g, "")
        const dangerous = [
            "rm-rf",
            "rm-rf--no-preserve-root",
            "mkfs",
            "rm-f",
            "rm-drf",
            "wipe",
            "shred",
            "chmod-r777",
            "chown",
            "find/-name*.log-delete",
            "/*",
            "*.*",
            "*",
            "/.",
            "/..",
            ">/dev/null"
        ]

        const isDangerous = dangerous.some(pattern => sanitized.includes(pattern)) && !isPendingCmd
        
        /*!-======[ Automatic Ai ]======-!*/
        let isBella = isMsg 
            && (Data.preferences[cht.id]?.ai_interactive || is.owner)
            && !is?.document 
            && !is.baileys
            && !is?.sticker 
            && (
                cht?.msg?.toLowerCase().startsWith(botnickname.toLowerCase().slice(0, botnickname.length - 1)) && !cht?.me
                || cht?.msg?.toLowerCase().startsWith(botnickname.toLowerCase())
                || is?.botMention
                || !is?.group
                || (is?.owner && cht?.msg?.toLowerCase().startsWith(botnickname.toLowerCase().slice(0, botnickname.length - 1)) && !cht?.me)
                || (is?.owner && is?.botMention)
            )

        if (isEvalSync) {
            if (!is?.owner) return
            if (isDangerous) {
                Data.users[cht.sender.split("@")[0]].command = cht.msg
                setTimeout(()=> delete Data.users[cht.sender.split("@")[0]].command, 5000)
                return cht.reply("Yakin?")
            }
            try {
                let evsync = await eval(`(async () => { ${cht?.msg?.slice(3)} })()`)
                if (typeof evsync !== 'string') evsync = await util.inspect(evsync)
                cht.reply(evsync)
            } catch (e) {
                cht.reply(String(e))
            }
        } else if (isEval) {
            if (!is?.owner) return
            if (isDangerous) {
                Data.users[cht.sender.split("@")[0]].command = cht.msg
                setTimeout(()=> delete Data.users[cht.sender.split("@")[0]].command, 5000)
                return cht.reply("Yakin?")
            }
            try {
                let evaled = await eval(cht?.msg?.slice(2))
                if (typeof evaled !== 'string') evaled = await util.inspect(evaled)
                if (evaled !== "undefined") { cht.reply(evaled) }
            } catch (err) {
                cht.reply(String(err))
            }
        } else if (isExec) {
            if (!is?.owner) return
            if (isDangerous) {
                Data.users[cht.sender.split("@")[0]].command = cht.msg
                setTimeout(()=> delete Data.users[cht.sender.split("@")[0]].command, 5000)
                return cht.reply("Yakin?")
            }
            let txt
            try {
                const { stdout, stderr } = await _exec(cht?.msg?.slice(2))
                txt = stdout || stderr
            } catch (error) {
                txt = `Error: ${error}`
            }
            cht.reply(txt)
        } else if (isBella) {
            let usr = cht.sender.split("@")[0]
            let user = Data.users[usr]
            let premium = user.premium ? Date.now() < user.premium.time : false
            user.autoai.use +=1
            if(Date.now() >= user.autoai.reset && !premium){
                user.autoai.use = 0
                user.autoai.reset = Date.now()+parseInt(user.autoai.delay)
                user.autoai.response = false
            }
            if(user.autoai.use > user.autoai.max && !premium){
                let formatTimeDur = Exp.func.formatDuration(user.autoai.reset - Date.now())
                let resetOn = Exp.func.dateFormatter(user.autoai.reset, "Asia/Jakarta")
                let txt = `*Limit interaksi telah habis!*\n\n*Waktu tunggu:*\n- ${formatTimeDur.days}hari ${formatTimeDur.hours}jam ${formatTimeDur.minutes}menit ${formatTimeDur.seconds}detik ${formatTimeDur.milliseconds}ms\n🗓*Direset Pada:* ${resetOn}\n\n*Ingin interaksi tanpa batas?*\nDapatkan premium!, untuk info lebih lanjut ketik *.premium*`
                if(!user.autoai.response){
                    user.autoai.response = true
                    cht.reply(txt)
                    return
                } else {
                    return
                }
            }
            
            let chat = cht?.msg?.startsWith(botnickname.toLowerCase()) ? cht?.msg?.slice(botnickname.length) : (cht?.msg || "" )
            let isImage = is?.image ? true : is.quoted?.image ? cht.quoted.sender !== Exp.number : false
            if (cht?.type === "audio") {
                try {
                    chat = (await transcribe(await cht?.download()))?.text ?? ""
                } catch (error) { 
                    console.error("Error transcribing audio:", error)
                    chat = ""
                }
            }
            if(isImage){
                let download = is.image ? cht?.download : cht?.quoted?.download
                isImage = await download()
                console.log(isImage)
            }
            chat = Exp.func.clearNumbers(chat)
            try {
                let _ai = await ai({ 
                   text: chat,
                   id: cht?.sender, 
                   fullainame: botfullname,
                   nickainame: botnickname, 
                   senderName: cht?.pushName, 
                   ownerName: ownername,
                   date: Exp.func.newDate(),
                   role: cht?.memories?.role,
                   msgtype: cht?.type,
                   _logic: " -kamu adalah gadis dengan rambut warna biru",
                   image: isImage
                })
                let config = _ai?.data ?? {}
                console.log(config)
                await Exp.func.addAiResponse()
                let noreply = false
                switch (config?.cmd) {
                    case 'public':
                        if (!is?.owner) return cht.reply("Maaf, males nanggepin")
                        global.cfg.public = true
                        return cht.reply("Berhasil mengubah mode menjadi public!")
                    case 'self':
                        if (!is?.owner) return cht.reply("Maaf, males nanggepin")
                        global.cfg.public = false
                        await cht.reply("Berhasil mengubah mode menjadi self!")
                    case 'voice':
                        await Exp.sendPresenceUpdate('recording', cht?.id)
                        return Exp.sendMessage(cht?.id, { audio: { url: `${api.xterm.url}/api/text2speech/bella?key=${api.xterm.key}&text=${config?.msg}`}, mimetype: "audio/mpeg", ptt: true }, { quoted: cht })
                    case 'tiktok':
                    case 'pinterestdl':
                    case 'menu':
                        noreply = true
                        is.url = [config?.cfg?.url ?? ""]
                        await cht.reply(config?.msg ?? "ok")
                        return ev.emit(config?.cmd)
                    case 'ytm4a':
                    case 'ytmp4':
                        noreply = true
                        cht.cmd = config?.cmd
                        is.url = [config?.cfg?.url ?? ""]
                        await cht.reply(config?.msg ?? "ok")
                        return ev.emit(config?.cmd)
                    case 'lora':
                        noreply = true
                        cht.q = `1552[2067]|${config?.cfg?.prompt}|blurry, low quality, low resolution, deformed, distorted, poorly drawn, bad anatomy, bad proportions, unrealistic, dull colors, oversaturated, underexposed, overexposed, watermark, text, logo, cropped, out of frame, multiple people, cluttered background, cartoonish, bad face, double face, abnormal`
                        await cht.reply(config?.msg ?? "ok")
                        return ev.emit("txt2img")
                    case 'txt2img':
                        cht.q = (config?.cfg?.prompt ?? "")
                        await cht.reply(config?.msg ?? "ok")
                        return ev.emit("dalle3")
                    case 'pinterest':
                        noreply = true
                        await cht.reply(config?.msg ?? "ok")
                        cht.q = config?.cfg?.query ?? ""
                        return ev.emit(config?.cmd)
                    case 'closegroup':
                        noreply = true
                        cht.q = "close"
                        return ev.emit("group")
                    case 'opengroup':
                        noreply = true
                        cht.q = "open"
                        return ev.emit("group")
                }
                
                if (config?.energy && cfg.ai_interactive.energy) {
                    let conf = {}
                    conf.energy = /[+-]/.test(`${config.energy}`) ? `${config.energy}` : `+${config.energy}`
                    if (conf.energy.startsWith("-")) {
                        conf.action = "reduceEnergy"
                    } else {
                        conf.action = "addEnergy"
                    }
                    await Exp.func.archiveMemories[conf.action](cht?.sender, parseInt(conf.energy.slice(1)))
                    await cht.reply(config.energy + " Energy⚡️")
                    config.energyreply = true
                }
                if (config?.cmd !== "voice" && !noreply) {
                    config?.msg && await cht[config?.energyreply ? "edit" : "reply"](config?.msg, keys[cht.sender])
                }
            } catch (error) {
                console.error("Error parsing AI response:", error)
            }
        }
    } catch (error) {
        console.error("Error in Interactive:", error)
    }
}
