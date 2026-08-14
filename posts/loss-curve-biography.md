*Every trained model has a life story, and we mostly throw it away.*

When a training run finishes, we keep the checkpoint and discard almost everything else. The final weights get evaluated, deployed, cited. But the path the model took to get there — the order in which it acquired capabilities, the features it learned and later abandoned — vanishes into a TensorBoard log nobody opens again.

This is a strange habit for a field that claims to care about understanding. Imagine a biologist who only ever studied adult organisms and considered development a logging artifact.

## What the curve doesn't show

The scalar loss curve is famously smooth, and famously misleading. Underneath its gentle descent, individual capabilities emerge in sudden phase transitions. Grokking is the well-known example, but smaller versions of it happen constantly: `induction_heads` forming in a burst, arithmetic snapping into place, a syntax rule going from noise to reliable in a few hundred steps.

> The aggregate hides the events. A smooth curve is what many sharp transitions look like when you average them.

If we logged the right per-capability metrics during training — not just at the end — we'd have something closer to a developmental record.

## A cheap proposal

Take any eval you already run at the end of training and run it at every checkpoint you were saving anyway:

```python
for ckpt in checkpoints:
    model = load(ckpt)
    for capability, eval_fn in probes.items():
        log(step=ckpt.step,
            metric=capability,
            value=eval_fn(model))
```

The cost is a rounding error next to the training run itself, and the resulting curves are often more informative than the final scores. Two models with identical end-of-training accuracy can have wildly different acquisition histories.

---

None of this is a new idea; developmental interpretability people have been saying it for years. My point is narrower: if you train models, your loss curve is a biography. It costs almost nothing to read it.
