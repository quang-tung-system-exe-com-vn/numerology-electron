'use client'
import { Loader2 } from 'lucide-react'
import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Button } from 'renderer/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from 'renderer/components/ui/dialog'
import { ScrollArea } from 'renderer/components/ui/scroll-area'

interface NumerologyInterpretationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  data: any
  type: 'cell' | 'general'
}

export function NumerologyInterpretationDialog({ open, onOpenChange, title, data, type }: NumerologyInterpretationDialogProps) {
  const [interpretation, setInterpretation] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)

  const generatePrompt = () => {
    if (type === 'cell') {
      const { number, instances } = data
      const sources = instances
        .map((inst: any) => {
          switch (inst.source) {
            case 'lastName':
              return 'họ'
            case 'middleName':
              return 'tên đệm'
            case 'firstName':
              return 'tên'
            case 'birthDate':
              return 'ngày sinh'
            default:
              return inst.source
          }
        })
        .join(', ')

      return `Hãy luận giải ý nghĩa của con số ${number} trong thần số học Pythagoras. Con số này xuất hiện ${instances.length} lần từ các nguồn: ${sources}.

Vui lòng phân tích:
1. Ý nghĩa cơ bản của con số ${number}
2. Tác động khi con số này xuất hiện ${instances.length} lần
3. Ảnh hưởng từ các nguồn khác nhau (${sources})
4. Lời khuyên và hướng phát triển

Trả lời bằng tiếng Việt một cách chi tiết và dễ hiểu.`
    }
    const { fullName, birthDate, grid } = data
    const gridSummary = grid.map((cell: any) => `Số ${cell.number}: ${cell.instances.length} lần`).join(', ')

    return `Hãy luận giải tổng quan thần số học Pythagoras cho:
- Họ tên: ${fullName}
- Ngày sinh: ${birthDate}
- Phân bố các con số: ${gridSummary}

Vui lòng phân tích:
1. Tổng quan về tính cách và đặc điểm cá nhân
2. Điểm mạnh và điểm cần phát triển
3. Hướng nghề nghiệp phù hợp
4. Mối quan hệ và tương tác xã hội
5. Lời khuyên cho cuộc sống và phát triển bản thân

Trả lời bằng tiếng Việt một cách chi tiết, có cấu trúc rõ ràng và dễ hiểu.`
  }

  const handleGetInterpretation = async () => {
    setIsLoading(true)
    try {
      const prompt = generatePrompt()
      const result = await window.api.openai.send_message({
        type: 'NUMEROLOGY_INTERPRETATION' as any,
        values: {
          prompt: prompt,
        },
      })

      setInterpretation(result || 'Không thể kết nối với AI để luận giải. Vui lòng thử lại sau.')
    } catch (error) {
      console.error('Error getting interpretation:', error)
      setInterpretation('Có lỗi xảy ra khi luận giải. Vui lòng thử lại sau.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setInterpretation('')
    }
    onOpenChange(newOpen)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="min-w-3xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{type === 'cell' ? 'Luận giải ý nghĩa của con số trong thần số học' : 'Luận giải tổng quan thần số học cá nhân'}</DialogDescription>
        </DialogHeader>

        <div className="flex-1 min-h-0">
          {!interpretation && !isLoading && (
            <div className="flex items-center justify-center py-8">
              <Button onClick={handleGetInterpretation} disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Đang luận giải...
                  </>
                ) : (
                  'Bắt đầu luận giải'
                )}
              </Button>
            </div>
          )}

          {isLoading && (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <Loader2 className="mx-auto h-8 w-8 animate-spin mb-4" />
                <p>AI đang phân tích và luận giải...</p>
              </div>
            </div>
          )}

          {interpretation && (
            <ScrollArea className="h-[400px] w-full rounded-md border p-4 overflow-auto">
              <div className="prose prose-sm max-w-none dark:prose-invert">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    // Tùy chỉnh styling cho các elements
                    h1: ({ children }) => <h1 className="text-xl font-bold mb-4 text-foreground">{children}</h1>,
                    h2: ({ children }) => <h2 className="text-lg font-semibold mb-3 text-foreground">{children}</h2>,
                    h3: ({ children }) => <h3 className="text-base font-medium mb-2 text-foreground">{children}</h3>,
                    p: ({ children }) => <p className="mb-3 text-foreground leading-relaxed">{children}</p>,
                    ul: ({ children }) => <ul className="mb-3 pl-4 space-y-1">{children}</ul>,
                    ol: ({ children }) => <ol className="mb-3 pl-4 space-y-1">{children}</ol>,
                    li: ({ children }) => <li className="text-foreground">{children}</li>,
                    strong: ({ children }) => <strong className="font-semibold text-foreground">{children}</strong>,
                    em: ({ children }) => <em className="italic text-foreground">{children}</em>,
                    blockquote: ({ children }) => <blockquote className="border-l-4 border-primary pl-4 my-4 italic text-muted-foreground">{children}</blockquote>,
                    code: ({ children }) => <code className="bg-muted px-1 py-0.5 rounded text-sm font-mono text-foreground">{children}</code>,
                    pre: ({ children }) => <pre className="bg-muted p-3 rounded-md overflow-x-auto mb-3">{children}</pre>,
                  }}
                >
                  {interpretation}
                </ReactMarkdown>
              </div>
            </ScrollArea>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            Đóng
          </Button>
          {interpretation && (
            <Button onClick={handleGetInterpretation} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang luận giải lại...
                </>
              ) : (
                'Luận giải lại'
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
