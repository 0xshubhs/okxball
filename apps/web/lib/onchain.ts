"use client";

/**
 * On-chain action layer for the Agentic Fantasy Football OS.
 *
 * - `useFantasyTx()` is a single write+confirm tracker a page reuses for all its
 *   actions (mint / train / join / submit / claim).
 * - `tx*()` builders return typed wagmi write configs; pages call
 *   `writeContractAsync(txMint(idx))`.
 * - `use*` read hooks pull live state, auto-disabled until contracts are deployed.
 *
 * Every action degrades gracefully: when a contract address is the zero address
 * (not deployed) the page falls back to its local demo simulation, so the app is
 * always navigable without a funded wallet.
 */

import { useMemo } from "react";
import {
  useAccount,
  useReadContract,
  useReadContracts,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import { parseEther, type Address } from "viem";
import {
  CONTRACTS,
  isDeployed,
  playerNFTAbi,
  fantasyLeagueAbi,
  payoutVaultAbi,
  MINT_PRICES,
  TRAIN_PRICE,
  LEAGUE_ENTRY_FEE_OKB,
  OPENING_LEAGUE_ID,
} from "./contracts";
import { defaultChain } from "./chains";

export type TxPhase = "idle" | "pending" | "confirming" | "success" | "error";

export type Deployed = {
  playerNFT: boolean;
  fantasyLeague: boolean;
  payoutVault: boolean;
  scoringOracle: boolean;
  any: boolean;
};

export function useDeployed(): Deployed {
  const playerNFT = isDeployed(CONTRACTS.playerNFT);
  const fantasyLeague = isDeployed(CONTRACTS.fantasyLeague);
  const payoutVault = isDeployed(CONTRACTS.payoutVault);
  const scoringOracle = isDeployed(CONTRACTS.scoringOracle);
  return {
    playerNFT,
    fantasyLeague,
    payoutVault,
    scoringOracle,
    any: playerNFT || fantasyLeague || payoutVault || scoringOracle,
  };
}

const explorerBase = defaultChain.blockExplorers?.default.url;
export const explorerTxUrl = (hash?: `0x${string}`) =>
  hash && explorerBase ? `${explorerBase}/tx/${hash}` : undefined;
export const explorerAddrUrl = (addr?: Address) =>
  addr && explorerBase ? `${explorerBase}/address/${addr}` : undefined;

/** One write+confirm tracker per page; pass the result to <TxToast />. */
export function useFantasyTx() {
  const { writeContractAsync, data: hash, isPending, error, reset } =
    useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({ hash, chainId: defaultChain.id });

  const status: TxPhase = error
    ? "error"
    : isConfirmed
      ? "success"
      : isConfirming
        ? "confirming"
        : isPending
          ? "pending"
          : "idle";

  return {
    writeContractAsync,
    hash,
    error,
    reset,
    isPending,
    isConfirming,
    isConfirmed,
    status,
    explorerUrl: explorerTxUrl(hash),
  };
}

/* ----------------------------- write builders ----------------------------- */

export const txMint = (rarityIdx: number) =>
  ({
    chainId: defaultChain.id,
    address: CONTRACTS.playerNFT,
    abi: playerNFTAbi,
    functionName: "mint",
    args: [rarityIdx],
    value: parseEther(String(MINT_PRICES[rarityIdx] ?? MINT_PRICES[0])),
  }) as const;

export const txTrain = (tokenId: number | bigint) =>
  ({
    chainId: defaultChain.id,
    address: CONTRACTS.playerNFT,
    abi: playerNFTAbi,
    functionName: "train",
    args: [BigInt(tokenId)],
    value: parseEther(String(TRAIN_PRICE)),
  }) as const;

export const txJoinLeague = (leagueId: number = OPENING_LEAGUE_ID) =>
  ({
    chainId: defaultChain.id,
    address: CONTRACTS.fantasyLeague,
    abi: fantasyLeagueAbi,
    functionName: "joinLeague",
    args: [BigInt(leagueId)],
    value: parseEther(String(LEAGUE_ENTRY_FEE_OKB)),
  }) as const;

export const txSubmitLineup = (
  tokenIds: Array<number | bigint>,
  captain: number | bigint,
  leagueId: number = OPENING_LEAGUE_ID,
) =>
  ({
    chainId: defaultChain.id,
    address: CONTRACTS.fantasyLeague,
    abi: fantasyLeagueAbi,
    functionName: "submitLineup",
    args: [BigInt(leagueId), tokenIds.map((t) => BigInt(t)), BigInt(captain)],
  }) as const;

export const txClaim = (leagueId: number = OPENING_LEAGUE_ID) =>
  ({
    chainId: defaultChain.id,
    address: CONTRACTS.payoutVault,
    abi: payoutVaultAbi,
    functionName: "claim",
    args: [BigInt(leagueId)],
  }) as const;

/* -------------------------------- reads ---------------------------------- */

export function useClaimable(address?: Address) {
  return useReadContract({
    address: CONTRACTS.payoutVault,
    abi: payoutVaultAbi,
    functionName: "claimable",
    args: address ? [address] : undefined,
    query: { enabled: isDeployed(CONTRACTS.payoutVault) && !!address },
  });
}

export function useJoined(
  address?: Address,
  leagueId: number = OPENING_LEAGUE_ID,
) {
  return useReadContract({
    address: CONTRACTS.fantasyLeague,
    abi: fantasyLeagueAbi,
    functionName: "joined",
    args: address ? [BigInt(leagueId), address] : undefined,
    query: { enabled: isDeployed(CONTRACTS.fantasyLeague) && !!address },
  });
}

export function usePlayerBalance(address?: Address) {
  return useReadContract({
    address: CONTRACTS.playerNFT,
    abi: playerNFTAbi,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: { enabled: isDeployed(CONTRACTS.playerNFT) && !!address },
  });
}

export function usePlayerLevel(tokenId?: number) {
  return useReadContract({
    address: CONTRACTS.playerNFT,
    abi: playerNFTAbi,
    functionName: "levelOf",
    args: tokenId != null ? [BigInt(tokenId)] : undefined,
    query: { enabled: isDeployed(CONTRACTS.playerNFT) && tokenId != null },
  });
}

export function useLeague(leagueId: number = OPENING_LEAGUE_ID) {
  return useReadContract({
    address: CONTRACTS.fantasyLeague,
    abi: fantasyLeagueAbi,
    functionName: "leagues",
    args: [BigInt(leagueId)],
    query: { enabled: isDeployed(CONTRACTS.fantasyLeague) },
  });
}

export function useManagers(leagueId: number = OPENING_LEAGUE_ID) {
  return useReadContract({
    address: CONTRACTS.fantasyLeague,
    abi: fantasyLeagueAbi,
    functionName: "managersOf",
    args: [BigInt(leagueId)],
    query: { enabled: isDeployed(CONTRACTS.fantasyLeague) },
  });
}

export type Standing = { rank: number; address: Address; points: number };

/** Live league standings from chain: managersOf → scoreOf each → sorted desc. */
export function useOnchainStandings(leagueId: number = OPENING_LEAGUE_ID) {
  const { data: managers } = useManagers(leagueId);
  const addrs = (managers as readonly Address[] | undefined) ?? [];

  const scores = useReadContracts({
    contracts: addrs.map((m) => ({
      address: CONTRACTS.fantasyLeague,
      abi: fantasyLeagueAbi,
      functionName: "scoreOf",
      args: [BigInt(leagueId), m],
    })),
    query: { enabled: isDeployed(CONTRACTS.fantasyLeague) && addrs.length > 0 },
  });

  const standings = useMemo<Standing[]>(() => {
    const list = (managers as readonly Address[] | undefined) ?? [];
    if (!list.length) return [];
    return list
      .map((address, i) => ({
        address,
        points: Number((scores.data?.[i]?.result as bigint | undefined) ?? 0n),
      }))
      .sort((a, b) => b.points - a.points)
      .map((row, idx) => ({ ...row, rank: idx + 1 }));
  }, [managers, scores.data]);

  return { standings, isLoading: scores.isLoading };
}

/** A manager's submitted lineup: [tokenIds, captain, submitted]. */
export function useSubmittedLineup(
  address?: Address,
  leagueId: number = OPENING_LEAGUE_ID,
) {
  return useReadContract({
    address: CONTRACTS.fantasyLeague,
    abi: fantasyLeagueAbi,
    functionName: "getLineup",
    args: address ? [BigInt(leagueId), address] : undefined,
    query: { enabled: isDeployed(CONTRACTS.fantasyLeague) && !!address },
  });
}

export { useAccount };
