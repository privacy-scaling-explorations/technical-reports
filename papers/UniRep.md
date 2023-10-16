# UniRep: A Protocol for Sharing Credibility Across Anonymous Accounts on Social Platforms

## Abstract

Current social platforms do not permit users to post anonymously while retaining the reputation of their primary accounts. For example, on Reddit, credibility is determined by the karma system. When creating a new, anonymous account, users start with zero karma, reducing trustworthiness. UniRep proposes a solution where users can establish anonymous accounts, yet provide proof of their aggregate reputation without disclosing their primary account identities. This is achieved through epoch-based attestations, where the platform confirms account reputation updates, and users validate their account ownership and updated reputations post each epoch.

## Introduction

In the digital era, the balance between online privacy and maintaining one's reputation on social platforms is increasingly complex. Privacy, motivated by security, freedom of expression, or the desire for personal anonymity, is a coveted asset. However, social platforms, designed around the ethos of reputation-building, often pose a conundrum for users. Positive contributions on these platforms translate to reputational gains, which in turn determine a user's credibility and influence within the community.

Despite the benefits of an established reputation, there are moments when even seasoned users wish to speak from behind the veil of anonymity, perhaps to share sensitive insights or express unorthodox opinions. Presently, the choice is stark: use an established identity or create a new anonymous account, starting from a reputational ground zero. New accounts frequently face diminished visibility, community skepticism, and potential flagging by automated systems.

Given this dilemma, there's a clear need for a system that marries the two seemingly contrasting ideals of privacy and reputation. UniRep aims to address this gap, proposing a solution that upholds the sanctity of anonymity while allowing users to leverage their hard-earned credibility.

## Preliminaries

### Terms and definitions

- **Attesters**: Entities or contracts that provide **attestations** to users, aggregating into user data.
- **Users**: Entities that acquire data from attesters and **validate received data**.
- **Epoch**: A cycle in the UniRep system marked by updated state and epoch trees. Attesters determine the epoch duration. User epoch keys can accumulate attestations within an epoch.
- **Epoch Key**: Temporary public identifiers for users.
- **User State Transition (UST)**: A process that combines a user's received data in an epoch to yield a new state tree.

### Assumptions

- The proof system is built on a phase 2 trusted setup.
- Network transaction costs for attestations and user registrations are considered moderate.
- Users retain their reputation data to produce User State Transition proofs.

## Proposed Protocol

The UniRep protocol is designed to function on an epoch-based mechanism, facilitating interactions between attestors and users, primarily for the management of reputations and state transitions. The protocol is implemented via a smart contract, which handles essential operations including registrations, attestations, and the maintenance of various cryptographic trees.

Attesters are joined into the system through the `attesterSignUp` function, which assigns a unique attesterId. Users also enter the system by registering through the `userSignUp` function and providing a distinct signup proof.

### User State Transitions

For each epoch, Attesters submit attestations in epoch trees, containing the data changes for each epoch key. While attesters are trusted to provide accurate updates, the protocol ensures user anonymity is preserved making it difficult to provide bias data toward any user.

Users engage in a User State Transition (UST), wherein the proof of several values are required, including a proof of a state tree leaf's presence in the previous epoch's tree, the validity of the epoch tree root and state tree root in the history tree. The UST process then requires users to aggregate data from each valid epoch key, outputting the combined data to be added to the new state tree and new epoch keys to be used for the following epoch. If an epoch key was not found in the epoch tree, it is reserved for the next epoch.

Following the generation of the UST proof, users execute an on-chain submission. This action triggers a series of validations, confirming the integrity of the history tree root, the lack of attestations for output epoch keys, and the uniqueness of the first output epoch key. The uniqueness of the first output epoch key is required to prevent duplicate USTs and is.

### Epoch Keys

Epoch keys serve as temporary identifiers, regenerated per epoch. They're computed using an `identitySecret`, unique to each user.

```js
const field = attesterId + (epoch << 160) + (nonce << 208);
poseidon2([identitySecret, field]);
```

The `nonce` is a value between `0` and `numEpochKeyNoncePerEpoch - 1` so that users may have `numEpochKeyNoncePerEpoch` epoch keys per epoch.

Although the data is often simplified as a singular value, it's actually a complex array, managed through FIELD_COUNT fields, and can be amalgamated via addition or replacement mechanisms.

Generally the data field so far has been considered to be a single value however it is actually an array of `FIELD_COUNT` values that can each be combined through either addition or replacement mechanisms.

As suggested, the addition mechanism provides a summation value and includes a modulo of `SNARK_SCALAR_FIELD`.

```js
data[0] = (old_data[0] + new_data[0]) % SNARK_SCALAR_FIELD;
```

Any data fields that do not use the addition mechanism instead use the replacement mechanism. This mechanism stores the data in `205` upper bits for the data and `48` lower bits for the nonce so that the protocol may order the attestations.

### Data Storage

The data required for the protocol operations is stored in three main trees: The State Tree, the Epoch Tree, and the History Tree.

The State Tree stores user's state values after signing up and after a UST is performed. Leafs contain the user's `identitySecret` and starting data in the format:

```js
H(H(identitySecret, attesterId + (epoch << 160)), H(data));
```

The Epoch Tree contains the data transitions received by epoch key in the epoch in each leaf stored in the format:

```js
H(epochKey, H(data[0]), H(data[1]), ...H(data[n]));
```

The History tree contains valid combinations of state and epoch tree roots in each leaf stored in the format:

```js
H(stateTreeRoot, epochTreeRoot);
```

## Discussion

UniRep's introduction to the digital ecosystem offers a transformative solution to a long-standing issue plaguing social platforms: the challenge of creating anonymous accounts without losing previously accrued reputational capital. In platforms such as Reddit, where reputation (or karma) directly influences the perceived credibility of a user, starting from scratch isn't just an inconvenience but a significant impediment. Anonymity often comes at the cost of trust, leading users to face skepticism and undermining their contributions.

UniRep's utility isn't just confined to platforms with explicit reputation metrics like Reddit. Consider GitHub, a platform where user contributions (in the form of code submissions or PRs) significantly benefit from the trust earned by contributors through consistent and quality submissions. By integrating UniRep, maintainers of a repository might be more inclined to trust and accept contributions from anonymous accounts. These contributors, through UniRep, can demonstrate a track record of credibility from other accounts, ensuring their contributions aren't dismissed outright due to the lack of an attached reputation.

However, while UniRep's potential applications are promising, there are challenges to consider. A primary concern arises from the inherent on-chain actions integral to the system. Depending on the blockchain's transaction fees, costs associated with attestations and user registrations might become prohibitive. This potential economic barrier could deter users and platforms from adopting the system. Hence, it's worth investigating alternative approaches, such as transitioning to a predominantly off-chain solution, which could circumvent these cost-related challenges and make the protocol more accessible.

In summary, while UniRep introduces a compelling solution to the dichotomy of privacy and reputation on digital platforms, its widespread adoption and success will depend on addressing the economic and technical challenges inherent in its design.

## Conclusion

UniRep introduces a novel approach to address the longstanding issue of balancing online privacy with the preservation of reputation on social platforms. By enabling users to transfer their reputation to anonymous accounts, the protocol fosters trustworthiness without compromising privacy. As digital interactions continue to evolve, protocols like UniRep are poised to redefine online credibility paradigms.
