import dotenv from 'dotenv'
dotenv.config()

import * as console from './logs'

/**
 * --------------------------------------------------
 *                  YUASHARDER V1
 *               IN CASE OF ISSUE/BUG
 * --------------------------------------------------
 * 
 * - Fork The Official Repo On Github
 * - Fix And Push Fix For Issue On Your Fork
 * - Create A Pull Request Asking To Merge Your Fork
 * 
 * --------------------------------------------------
 *       https://github.com/NobUwU/yuasharder/
 * --------------------------------------------------
 */
import { Manager } from 'yuasharder'

(async function(): Promise<void> {
  (await import('./database')).default

  const manager = new Manager(process.env.TOKEN, '/dist/client.js', {
    statsInterval: parseInt(process.env.STATS_INTERVAL) || 15000,
    totalShards: parseInt(process.env.TOTAL_SHARDS) || 1,
    totalClusters: parseInt(process.env.TOTAL_CLUSTERS) || 1,
    clientOptions: {
      getAllUsers: process.env.FETCH_ALL_MEMBERS === 'true' ? true : false,
    },
  })

  manager.on('info', (info) => {
    console.custom('INFO', 'blue', info)
  })
    .on('error', (err) => {
      console.custom('ERROR', 'red', err)
    })
    .on('clusterInfo', (clusterInfo) => {
      console.custom("CLUSTER_INFO", 'cyan', `{${clusterInfo.clusterID}}`, `[${clusterInfo.shards[0]}, ${clusterInfo.shards[1]}]`, "::", clusterInfo.message)
    })
    .on('clusterWarn', (clusterWarn) => {
      console.custom("CLUSTER_WARN", 'yellow', `{${clusterWarn.clusterID}}`, `[${clusterWarn.shards[0]}, ${clusterWarn.shards[1]}]`, "::", clusterWarn.message)
    })
    .on('clusterError', (clusterError) => {
      console.custom("CLUSTER_ERROR", 'red', `{${clusterError.clusterID}}`, `[${clusterError.shards[0]}, ${clusterError.shards[1]}]`, "::", clusterError.message)
    })
    .on('shardConnect', (shard) => {
      console.custom("SHARD_CONNECT", 'green', `{${shard.clusterID}}`, `(${shard.shard})`, `[${shard.shards[0]}, ${shard.shards[1]}]`, "::", shard.message)
    })
    .on('shardDisconnect', (shard) => {
      console.custom("SHARD_DISCONNECT", 'red', `{${shard.clusterID}}`, `(${shard.shard})`, `[${shard.shards[0]}, ${shard.shards[1]}]`, "::", shard.message)
    })
    .on('shardError', (shard) => {
      console.custom("SHARD_ERROR", 'red', `{${shard.clusterID}}`, `(${shard.shard})`, `[${shard.shards[0]}, ${shard.shards[1]}]`, "::", shard.message)
    })
    .on('shardReady', (shard) => {
      console.custom("SHARD_READY", 'green', `{${shard.clusterID}}`, `(${shard.shard})`, `[${shard.shards[0]}, ${shard.shards[1]}]`, "::", shard.message)
    })
    .on('shardResume', (shard) => {
      console.custom("SHARD_RESUME", 'yellow', `{${shard.clusterID}}`, `(${shard.shard})`, `[${shard.shards[0]}, ${shard.shards[1]}]`, "::", shard.message)
    })
    .on('shardWarn', (shard) => {
      console.custom("SHARD_WARN", 'yellow', `{${shard.clusterID}}`, `(${shard.shard})`, `[${shard.shards[0]}, ${shard.shards[1]}]`, "::", shard.message)
    })

  manager.launch()

})()
