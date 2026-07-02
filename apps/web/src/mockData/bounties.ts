import { demoOverview } from '../data/demo'

export const mockBounties = demoOverview.tasks.map((task) => ({
  ...task,
  rewardPerAsset: task.reward,
}))
