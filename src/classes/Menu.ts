/* eslint-disable @typescript-eslint/no-empty-function */
import { EventEmitter } from'events'
import Yua from 'src/client'
import Eris from 'eris'
import { colors } from '../config'

export interface MenuReactionQuestion {
  content: string | { embed: Eris.EmbedOptions }
  reactions: (Eris.Emoji | string)[]
}

export interface MenuResponseQuestion {
  content: string | { embed: Eris.EmbedOptions }
  callback?: (message: Eris.Message) => (boolean | string) | Promise<boolean | string>
  /**
   * Return a string in callback
   * @deprecated
   */
  invalidResponse?: string
}

export interface MenuOptions {
  collectorTimeout?: number
  bailWord?: string
  purgeAllWhenDone?: boolean
}

enum EndReasons {
  guildDelete = 'guildDelete',
  channelDelete = 'channelDelete',
  cancel = 'cancel',
  error = 'error',
  finish = 'finish',
  timedOut = 'timedOut',
}
enum Events {
  end = 'end'
}

export interface EventValue<R extends (Eris.Message | Eris.Emoji)[]> {
  end: [R, (
    'guildDelete' |
    'channelDelete' |
    'cancel' |
    'error' |
    'finish' |
    'timedOut'
  )]
}

interface Menu<R extends (Eris.Message | Eris.Emoji | undefined)[]> {
  ended: boolean
  collected: R
  new (yua: Yua, options?: MenuOptions)
  addResponseQuestion(question: MenuResponseQuestion): this
  addReactionQuestion(question: MenuReactionQuestion): this
  start(msg: Eris.Message): this
  stop(reason: string): this
  resetTimer(time?: number): this
  on<K extends keyof EventValue<R>>(event: K, callback: (...args: EventValue<R>[K]) => void): this
  on<S extends string | symbol>(
    event: Exclude<S, keyof EventValue<R>>,
    callback: (...args: unknown[]) => void,
  ): this
  once<K extends keyof EventValue<R>>(event: K, callback: (...args: EventValue<R>[K]) => void): this
  once<S extends string | symbol>(
    event: Exclude<S, keyof EventValue<R>>,
    callback: (...args: unknown[]) => void
  ): this
  emit<K extends keyof EventValue<R>>(event: K, ...args: EventValue<R>[K]): boolean
  emit<S extends string | symbol>(
    event: Exclude<S, keyof EventValue<R>>,
    ...args: unknown[]
  ): boolean
}

class Menu<R extends (Eris.Message | Eris.Emoji | undefined)[]> extends EventEmitter {
  private yua: Yua
  private _questions: (MenuReactionQuestion | MenuResponseQuestion)[] = []
  private _collectorTimeout = 30000
  private _timeout = null
  private _bailWord = 'cancel'
  private _guildId: string
  private _channelId: string
  private _authorId: string
  private _queue: (MenuReactionQuestion | MenuResponseQuestion)[] = []
  private _currentQuestionMessageId: string
  private _msgDelete: Eris.Message[] = []
  private _purgeAllWhenDone = false
  public ended = false
  public collected: R = [] as R
  constructor(yua: Yua, options?: MenuOptions) {
    super()
    this.yua = yua
    this._collectorTimeout = options?.collectorTimeout ? options.collectorTimeout : 30000
    this._bailWord = options?.bailWord ? options.bailWord : 'cancel'
    this._purgeAllWhenDone = options?.purgeAllWhenDone ? options.purgeAllWhenDone : false

    this._handleResponse = this._handleResponse.bind(this)
    this._handleReaction = this._handleReaction.bind(this)
    this._handleChannelDeletion = this._handleChannelDeletion.bind(this)
    this._handleGuildDeletion = this._handleGuildDeletion.bind(this)
    this._handleMessageDeletion = this._handleMessageDeletion.bind(this)
    this._handleBulkMessageDeletion = this._handleBulkMessageDeletion.bind(this)
    this._handleReactionDelete = this._handleReactionDelete.bind(this)
    this._handleReactionDeleteAll = this._handleReactionDeleteAll.bind(this)
    this._handleReactionDeleteEmoji = this._handleReactionDelete.bind(this)

    this.yua.client.on("channelDelete", this._handleChannelDeletion)
    this.yua.client.on("guildDelete", this._handleGuildDeletion)
    this.yua.client.on("messageDelete", this._handleMessageDeletion)
    this.yua.client.on("messageDeleteBulk", this._handleBulkMessageDeletion)
    this.yua.client.on("messageReactionRemove", this._handleReactionDelete)
    this.yua.client.on("messageReactionRemoveAll", this._handleReactionDeleteAll)
    this.yua.client.on("messageReactionRemoveEmoji", this._handleReactionDeleteEmoji)

    this.once(Events.end, () => {
      // console.log("end", reason)
      this.yua.client.removeListener("messageCreate", this._handleResponse)
      this.yua.client.removeListener("messageReactionAdd", this._handleReaction)
      this.yua.client.removeListener("channelDelete", this._handleChannelDeletion)
      this.yua.client.removeListener("guildDelete", this._handleGuildDeletion)
      this.yua.client.removeListener("messageDelete", this._handleMessageDeletion)
      this.yua.client.removeListener("messageDeleteBulk", this._handleBulkMessageDeletion)
      this.yua.client.removeListener("messageReactionRemove", this._handleReactionDelete)
      this.yua.client.removeListener("messageReactionRemoveAll", this._handleReactionDeleteAll)
      this.yua.client.removeListener("messageReactionRemoveEmoji", this._handleReactionDeleteEmoji)
      if (this._purgeAllWhenDone) {
        setTimeout(() => {
          try {
            // console.log(this._msgDelete.map(msg => msg.id), this._authorId)
            this.yua.client.deleteMessages(this._channelId, this._msgDelete.map(m => m.id), "Reaction Role Menu Creation Cleanup").catch((err) => {
              if (process.env.NODE_ENV === 'development') {
                this.yua.console.error("Caught Error: Menu.bulkDelete: This error will only show in NODE_ENV=development.\n", err)
              }
            })
          } catch (err) {
            if (process.env.NODE_ENV === 'development') {
              this.yua.console.error("Caught Error: Menu.bulkDelete: This error will only show in NODE_ENV=development.\n", err)
            }
          }
        }, 3000)
      }
    })

  }

  public addResponseQuestion(question: MenuResponseQuestion): this {
    this._questions.push(question)

    return this
  }
  public addReactionQuestion(question: MenuReactionQuestion): this {
    this._questions.push(question)

    return this
  }

  public addMessageToPrune(msg: Eris.Message): this {
    this._msgDelete.push(msg)

    return this
  }

  public start(message: Eris.Message): this {
    this._guildId = message.guildID
    this._channelId = message.channel.id
    this._authorId = message.member.id
    this._queue = new Array(...this._questions)
    this._timeout = setTimeout(() => this.stop(EndReasons.timedOut), this._collectorTimeout)
    this.yua.client.on("messageCreate", this._handleResponse)
    this.yua.client.on("messageReactionAdd", this._handleReaction)
    this._start()

    return this
  }
  public stop(reason: "guildDelete" | "channelDelete" | "cancel" | "error" | "finish" | "timedOut"): this {
    if (this.ended) return
    if (this._timeout) {
      clearTimeout(this._timeout)
      this._timeout = null
    }
    this.ended = true
    this.emit('end', this.collected, reason)

    return this
  }
  public resetTimer(time?: number): this {
    if (this._timeout) {
      clearTimeout(this._timeout)
      this._timeout = setTimeout(() => this.stop(EndReasons.timedOut), time || this._collectorTimeout)
    }

    return this
  }
  private _start(): void {
    if (this._queue.length < 1) {
      this.stop(EndReasons.finish)

      return
    }
    this.resetTimer()
    const item = this._queue[0]
    if ("reactions" in item) {
      this.send(item.content)
        .then((m) => {
          // console.log(m.id)
          this._msgDelete.push(m)
          this._currentQuestionMessageId = m.id
          for (const emoji of item.reactions) {
            m.addReaction(typeof emoji === 'string' ? emoji : `${ emoji.animated ? "a" : "" }:${emoji.name}:${emoji.id}`)
              .catch(() => { /* Do Nothing */ })
          }
        })
    } else {
      this.send(item.content)
        .then((m) => {
          // console.log(m.id)
          this._msgDelete.push(m)
          this._currentQuestionMessageId = m.id
        })
    }
  }
  private async _handleResponse(msg: Eris.Message): Promise<void> {
    if (msg.channel.id === this._channelId && msg.author.id === this._authorId) {
      this._msgDelete.push(msg)
      if (msg.content.toLowerCase() === this._bailWord) {
        this.stop(EndReasons.cancel)

        return
      }
      const item = this._queue[0]
      if ("callback" in item) {
        const cb = await item.callback(msg)
        //console.log(cb)
        if (typeof cb === 'boolean' && cb) {
          this.collected.push(msg)
          this._queue.shift()
          this._start()
        } else {
          if (typeof cb === 'string') {
            this.send({
              embed: {
                color: colors.error,
                description: cb,
              },
            })
              .then((m) => { this._msgDelete.push(m) })
          } else {
            this.send({
              embed: {
                color: colors.error,
                description: item.invalidResponse || "Invalid Response ;-; Please Try Again or Type `" + this._bailWord + "`",
              },
            })
              .then((m) => { this._msgDelete.push(m) })
          }
        }
      } else {
        if ("reactions" in item) {
          return
        }
        this.collected.push(msg)
        this._queue.shift()
        this._start()
      }
    }
  }
  private _handleReaction(msg: Eris.Message, emoji: Eris.Emoji, reactor: Eris.Member): void {
    if (msg.channel.id === this._channelId && reactor.id === this._authorId && msg.id === this._currentQuestionMessageId) {
      const item = this._queue[0]
      if ("reactions" in item) {
        const reactionNames: string[] = []
        for (const r of item.reactions) {
          if (typeof r === 'string') reactionNames.push(r)
          else reactionNames.push(r.name)
        }
        if (reactionNames.includes(emoji.name)) {
          this.collected.push(emoji)
          this._queue.shift()
          this._start()
        } else {
          msg.removeReactionEmoji(emoji.id ? `${ emoji.animated ? "a" : "" }:${emoji.name}:${emoji.id}` : emoji.name).catch(() => { /* Do Nothing */ })
        }
      }
    } else {
      if (reactor.id !== this.yua.client.user.id) {
        msg.removeReaction(emoji.id ? `${ emoji.animated ? "a" : "" }:${emoji.name}:${emoji.id}` : emoji.name, reactor.id).catch(() => { /* Do Nothing */ })
      }
    }
  }
  private _handleReactionDelete(message: Eris.Message, emoji: Eris.Emoji): void {
    if (this._currentQuestionMessageId && this._currentQuestionMessageId === message.id) {
      const item = this._queue[0]
      if ("reactions" in item) {
        const reactionNames: string[] = []
        for (const r of item.reactions) {
          if (typeof r === 'string') reactionNames.push(r)
          else reactionNames.push(r.name)
        }
        if (reactionNames.includes(emoji.name)) {
          message.addReaction(emoji.id ? `${ emoji.animated ? "a" : "" }:${emoji.name}:${emoji.id}` : emoji.name).catch(() => { /* Do Nothing */ })
        }
      }
    }
  }
  private _handleReactionDeleteEmoji(message: Eris.Message, emoji: Eris.Emoji): void {
    if (this._currentQuestionMessageId && this._currentQuestionMessageId === message.id) {
      const item = this._queue[0]
      if ("reactions" in item) {
        const reactionNames: string[] = []
        for (const r of item.reactions) {
          if (typeof r === 'string') reactionNames.push(r)
          else reactionNames.push(r.name)
        }
        if (reactionNames.includes(emoji.name)) {
          message.addReaction(emoji.id ? `${ emoji.animated ? "a" : "" }:${emoji.name}:${emoji.id}` : emoji.name).catch(() => { /* Do Nothing */ })
        }
      }
    }
  }
  private _handleReactionDeleteAll(message: Eris.Message): void {
    if (this._currentQuestionMessageId && this._currentQuestionMessageId === message.id) {
      const item = this._queue[0]
      if ("reactions" in item) {
        for (const emoji of item.reactions) {
          message.addReaction(typeof emoji === 'string' ? emoji : `${ emoji.animated ? "a" : "" }:${emoji.name}:${emoji.id}`).catch(() => { /* Do Nothing */ })
        }
      }
    }
  }
  private _handleMessageDeletion(msg: Eris.Message): void {
    if (this._currentQuestionMessageId && this._currentQuestionMessageId === msg.id) {
      const item = this._queue[0]
      if ("reactions" in item) {
        this.send(item.content)
          .then((m) => {
            this._msgDelete.push(m)
            this._currentQuestionMessageId = m.id
            for (const emoji of item.reactions) {
              m.addReaction(typeof emoji === 'string' ? emoji : `${ emoji.animated ? "a" : "" }:${emoji.name}:${emoji.id}`)
                .catch(() => { /* Do Nothing */ })
            }
          })
      } else {
        this.send(item.content)
          .then((m) => {
            this._msgDelete.push(m)
            this._currentQuestionMessageId = m.id
          })
      }
    }
  }
  private _handleBulkMessageDeletion(msgs: Eris.Message[]): void {
    const ids = msgs.map(m => m.id)
    if (this._currentQuestionMessageId && ids.includes(this._currentQuestionMessageId)) {
      const item = this._queue[0]
      if ("reactions" in item) {
        this.send(item.content)
          .then((m) => {
            this._msgDelete.push(m)
            this._currentQuestionMessageId = m.id
            for (const emoji of item.reactions) {
              m.addReaction(typeof emoji === 'string' ? emoji : `${ emoji.animated ? "a" : "" }:${emoji.name}:${emoji.id}`)
                .catch(() => { /* Do Nothing */ })
            }
          })
      } else {
        this.send(item.content)
          .then((m) => {
            this._msgDelete.push(m)
            this._currentQuestionMessageId = m.id
          })
      }
    }
  }
  private _handleChannelDeletion(channel: Eris.Channel): void {
    if (channel.id === this._channelId) {
      this.stop(EndReasons.channelDelete)
    }
  }
  private _handleGuildDeletion(guild: Eris.Guild): void {
    if (guild.id === this._guildId) {
      this.stop(EndReasons.guildDelete)
    }
  }
  /**
   * Helper function for creating messages
   * 
   * Errors are caught and only thrown if NODE_ENV=development
   */
  private send(content: string | { embed: Eris.EmbedOptions }): Promise<Eris.Message> {
    const message = this.yua.client.createMessage(this._channelId, content)
    message.catch((err) => {
      if (process.env.NODE_ENV === 'development') {
        this.yua.console.error("Caught Error: Menu.send: This error will only show in NODE_ENV=development.\n", err)
      }
      this.stop(EndReasons.error)
    })
    
    return message
  }
}

//const m = new Menu<[string, Eris.Emoji]>("" as unknown as Yua)

export {
  Menu,
}
