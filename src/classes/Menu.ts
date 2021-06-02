/* eslint-disable @typescript-eslint/no-empty-function */
import { EventEmitter } from'events'
import Yua from 'src/client'
import Eris from 'eris'
import { colors } from '../config'

export interface MenuReactionQuestion {
  content: string | { embed: Eris.EmbedOptions }
  reactions: Eris.Emoji[]
}

export interface MenuResponseQuestion {
  content: string | { embed: Eris.EmbedOptions }
  callback: (message: Eris.Message) => boolean | string
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
  private _msgDelete: string[] = []
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
            this.yua.client.deleteMessages(this._channelId, this._msgDelete, "Reaction Role Menu Creation Cleanup")
          } catch (err) {}
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

  public start(message: Eris.Message): this {
    this._guildId = message.guildID
    this._channelId = message.channel.id
    this._authorId = message.author.id
    this._queue = new Array(...this._questions)
    this._timeout = setTimeout(() => this.stop(EndReasons.timedOut), this._collectorTimeout)
    this.yua.client.on("messageCreate", this._handleResponse)
    this.yua.client.on("messageReactionAdd", this._handleReaction)
    this._start()

    return this
  }
  public stop(reason: string): this {
    if (this.ended) return
    if (this._timeout) {
      clearTimeout(this._timeout)
      this._timeout = null
    }
    this.ended = true
    this.emit('end', this.collected, reason as "guildDelete" | "channelDelete" | "cancel" | "error" | "finish" | "timedOut")

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
    if ("callback" in item) {
      this.yua.client.createMessage(this._channelId, item.content)
        .then((m) => {
          this._msgDelete.push(m.id)
          this._currentQuestionMessageId = m.id
        })
    } else if ("reactions" in item) {
      this.yua.client.createMessage(this._channelId, item.content)
        .then((m) => {
          this._msgDelete.push(m.id)
          this._currentQuestionMessageId = m.id
          for (const emoji of item.reactions) {
            m.addReaction(`${ emoji.animated ? "a" : "" }:${emoji.name}:${emoji.id}`)
              .then(() => {})
              .catch(() => {})
          }
        })
        .catch(() => {})
    } else this.stop(EndReasons.error)
  }
  private _handleResponse(msg: Eris.Message): void {
    if (msg.channel.id === this._channelId && msg.author.id === this._authorId) {
      this._msgDelete.push(msg.id)
      if (msg.content.toLowerCase() === this._bailWord) {
        this.stop(EndReasons.cancel)

        return
      }
      const item = this._queue[0]
      if ("callback" in item) {
        const cb = item.callback(msg)
        if (typeof cb === 'boolean' && cb) {
          this.collected.push(msg)
          this._queue.shift()
          this._start()
        } else {
          if (typeof cb === 'string') {
            this.yua.client.createMessage(this._channelId, {
              embed: {
                color: colors.error,
                description: cb,
              },
            })
              .then((m) => { this._msgDelete.push(m.id) })
          } else {
            this.yua.client.createMessage(this._channelId, {
              embed: {
                color: colors.error,
                description: item.invalidResponse || "Invalid Response ;-; Please Try Again or Type `" + this._bailWord + "`",
              },
            })
              .then((m) => { this._msgDelete.push(m.id) })
          }
        }
      }
    }
  }
  private _handleReaction(msg: Eris.Message, emoji: Eris.Emoji, reactor: Eris.Member): void {
    if (msg.channel.id === this._channelId && reactor.id === this._authorId) {
      const item = this._queue[0]
      if ("reactions" in item) {
        if (item.reactions.map(r => r.id).includes(emoji.id)) {
          this.collected.push(emoji)
          this._queue.shift()
          this._start()
        } else {
          msg.removeReactionEmoji(`${ emoji.animated ? "a" : "" }:${emoji.name}:${emoji.id}`).catch(() => {})
        }
      }
    } else {
      if (reactor.id !== this.yua.client.user.id) {
        msg.removeReaction(`${ emoji.animated ? "a" : "" }:${emoji.name}:${emoji.id}`, reactor.id)
      }
    }
  }
  private _handleReactionDelete(message: Eris.Message, emoji: Eris.Emoji): void {
    if (this._currentQuestionMessageId && this._currentQuestionMessageId === message.id) {
      const item = this._queue[0]
      if ("reactions" in item) {
        const reactionIds = item.reactions.map(r => r.id)
        if (reactionIds.includes(emoji.id)) {
          message.addReaction(`${ emoji.animated ? "a" : "" }:${emoji.name}:${emoji.id}`)
        }
      }
    }
  }
  private _handleReactionDeleteEmoji(message: Eris.Message, emoji: Eris.Emoji): void {
    if (this._currentQuestionMessageId && this._currentQuestionMessageId === message.id) {
      const item = this._queue[0]
      if ("reactions" in item) {
        const reactionIds = item.reactions.map(r => r.id)
        if (reactionIds.includes(emoji.id)) {
          message.addReaction(`${ emoji.animated ? "a" : "" }:${emoji.name}:${emoji.id}`)
        }
      }
    }
  }
  private _handleReactionDeleteAll(message: Eris.Message): void {
    if (this._currentQuestionMessageId && this._currentQuestionMessageId === message.id) {
      const item = this._queue[0]
      if ("reactions" in item) {
        for (const emoji of item.reactions) {
          message.addReaction(`${ emoji.animated ? "a" : "" }:${emoji.name}:${emoji.id}`)
            .then(() => {})
            .catch(() => {})
        }
      }
    }
  }
  private _handleMessageDeletion(msg: Eris.Message): void {
    if (this._currentQuestionMessageId && this._currentQuestionMessageId === msg.id) {
      const item = this._queue[0]
      if ("callback" in item) {
        this.yua.client.createMessage(this._channelId, item.content)
          .then((m) => {
            this._msgDelete.push(m.id)
            this._currentQuestionMessageId = m.id
          })
      } else if ("reactions" in item) {
        this.yua.client.createMessage(this._channelId, item.content)
          .then((m) => {
            this._msgDelete.push(m.id)
            this._currentQuestionMessageId = m.id
            for (const emoji of item.reactions) {
              m.addReaction(`${ emoji.animated ? "a" : "" }:${emoji.name}:${emoji.id}`)
                .then(() => {})
                .catch(() => {})
            }
          })
          .catch(() => {})
      } else this.stop(EndReasons.error)
    }
  }
  private _handleBulkMessageDeletion(msgs: Eris.Message[]): void {
    const ids = msgs.map(m => m.id)
    if (this._currentQuestionMessageId && ids.includes(this._currentQuestionMessageId)) {
      const item = this._queue[0]
      if ("callback" in item) {
        this.yua.client.createMessage(this._channelId, item.content)
          .then((m) => {
            this._msgDelete.push(m.id)
            this._currentQuestionMessageId = m.id
          })
      } else if ("reactions" in item) {
        this.yua.client.createMessage(this._channelId, item.content)
          .then((m) => {
            this._msgDelete.push(m.id)
            this._currentQuestionMessageId = m.id
            for (const emoji of item.reactions) {
              m.addReaction(`${ emoji.animated ? "a" : "" }:${emoji.name}:${emoji.id}`)
                .then(() => {})
                .catch(() => {})
            }
          })
          .catch(() => {})
      } else this.stop(EndReasons.error)
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
}

//const m = new Menu<[string, Eris.Emoji]>("" as unknown as Yua)

export {
  Menu,
}
